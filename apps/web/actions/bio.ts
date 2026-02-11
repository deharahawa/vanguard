"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";

interface MealLog {
    id: string;
    userId: string;
    date: Date;
    type: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
    items: string[];
    calories?: number;
    protein?: number;
}
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { google } from "@ai-sdk/google";

const nutritionSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  name: z.string().optional().describe("Suggested name for the meal"),
});

async function getUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

async function addXP(userId: string, perkId: string, amount: number) {
  const userPerk = await prisma.userPerk.findUnique({
    where: { userId_perkId: { userId, perkId } },
  });

  if (!userPerk) return;

  const newXP = userPerk.xp + amount;
  const newLevel = Math.floor(newXP / 100) + 1; 

  await prisma.userPerk.update({
    where: { id: userPerk.id },
    data: { xp: newXP, level: newLevel },
  });
}

export async function scanNutritionLabel(formData: FormData) {
  const file = formData.get("image") as File;
  
  if (!file) throw new Error("No image provided");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: nutritionSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Extract calories, protein, carbs, fat per serving from this nutrition label. If a name is visible, extract it too." },
            { type: "image", image: base64Image },
          ],
        },
      ],
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { success: false, error: "Failed to scan label" };
  }
}

export async function saveMealTemplate(data: { name: string; calories: number; protein: number; carbs: number; fat: number }) {
  const user = await getUser();
  
  const meal = await prisma.meal.create({
    data: {
      userId: user.id,
      ...data,
      isTemplate: true,
    }
  });
  
  revalidatePath("/bio");
  return { success: true, meal };
}

// Old logMeal removed to avoid conflict. 
// Use logMealIntake if strictly needed for templates, or the new logMeal for freeform.
// export async function logMealIntake(mealId: string, quantity: number) { ... }

export async function logWorkout(data: {
  date: Date;
  type: string;
  notes: string;
  imageUrl?: string;
  sets: { name: string; weight: number; reps: number }[];
}) {
  const user = await getUser();

  await prisma.workoutSession.create({
    data: {
      userId: user.id,
      date: data.date,
      type: data.type,
      notes: data.notes,
      imageUrl: data.imageUrl,
      isTemplate: false, // Explicitly false for logs
      sets: {
        create: data.sets,
      },
    },
  });

  await addXP(user.id, "bio_engine", 50);
  revalidatePath("/bio");
  return { success: true };
}

export async function saveWorkoutTemplate(data: {
    name: string; // "Program A", "Program B", "Program C"
    type: string;
    sets: { name: string; weight: number; reps: number }[];
}) {
    const user = await getUser();

    // Upsert logic for template: find existing template by name and update it, or create new
    // Since we don't have a unique constraint on (userId, name, isTemplate), we findFirst then update/create
    const existing = await prisma.workoutSession.findFirst({
        where: {
            userId: user.id,
            isTemplate: true,
            name: data.name
        }
    });

    if (existing) {
        // Update: delete old sets and recreate new ones (simplest way to handle set changes)
        await prisma.exerciseSet.deleteMany({
            where: { sessionId: existing.id }
        });

        await prisma.workoutSession.update({
            where: { id: existing.id },
            data: {
                sets: {
                    create: data.sets
                }
            }
        });
    } else {
        await prisma.workoutSession.create({
            data: {
                userId: user.id,
                name: data.name,
                isTemplate: true,
                type: data.type,
                sets: {
                    create: data.sets
                }
            }
        });
    }
    
    revalidatePath("/bio");
    return { success: true };
}

export async function getWorkoutTemplates() {
    const user = await getUser();
    const templates = await prisma.workoutSession.findMany({
        where: {
            userId: user.id,
            isTemplate: true
        },
        include: {
            sets: true
        }
    });
    return templates as any;
}

export async function logBio(data: {
  date: Date;
  sleepStart?: Date;
  sleepEnd?: Date;
  sleepQuality?: number;
  morningVitality?: boolean;
  stoolType?: number;
  stoolColor?: string;
  stoolNotes?: string;
}) {
  const user = await getUser();

  // Handle upsert specifically for the date
  // Since we have @@unique([userId, date]), we need to match exact date object or valid range.
  // The schema uses DateTime @default(now()) but the unique constaint is on the exact implementation.
  // Usually we store just the date part for daily logs, but here it's DateTime.
  // We should probably normalize the date to midnight or rely on the id if updating.
  // BUT the request implies "Daily input". Storing exact timestamp might duplicate if not careful.
  // For `BioMetric`, the `date` should probably be normalized.
  
  // Normalizing date to start of day for the unique constraint to check correctly
  const workingDate = new Date(data.date);
  // We can't easily query by "start of day" in upsert unique match without a specific field.
  // However, `date` is a field. We must ensure the client sends the same timestamp or we query differently.
  // For now, let's assume the client sends a normalized date or we handle it.
  // Best practice: normalize to midnight UTC or local.
  workingDate.setHours(0,0,0,0);

  // Check if exists first to avoid unique constraint error if we can't perfectly match in upsert 'where'
  const existing = await prisma.bioMetric.findFirst({
    where: {
      userId: user.id,
      date: workingDate, 
    }
  });

  if (existing) {
    await prisma.bioMetric.update({
      where: { id: existing.id },
      data: {
        ...data,
        date: workingDate, // Ensure normalized
      }
    });
  } else {
    await prisma.bioMetric.create({
      data: {
        userId: user.id,
        ...data,
        date: workingDate,
      }
    });
  }

  await addXP(user.id, "bio_engine", 10);
  revalidatePath("/bio");
  return { success: true };
}

export async function getBioStats(days: number = 30) {
  const user = await getUser();
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - days);

  const logs = await prisma.bioMetric.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate },
    },
    orderBy: { date: "asc" },
  });

  return logs.map(log => ({
    date: log.date.toISOString().split("T")[0],
    sleep: log.sleepQuality || 0,
    calories: log.calories || 0,
    protein: log.protein || 0,
    volume: log.workoutVolume || 0,
  }));
}

export async function consultBioAI(context: "MEAL" | "WORKOUT" | "SLEEP", data: any) {
    // const user = await getUser(); // Unused for now, generic advice based on data input
    
    // System Prompt for Bio-Engine (PT-BR)
    const systemPrompt = `Você é o Bio-Engenheiro do Vanguard Protocol. 
    Seu objetivo é analisar dados biológicos e de performance para otimizar o "Operator".
    
    Diretrizes Táticas:
    1. Responda ESTRITAMENTE em Português do Brasil.
    2. Seja direto, científico e sem 'fluff' (embromação).
    3. Use terminologia militar/tática quando apropriado.
    4. Avalie os dados fornecidos e dê um VEREDITO (Aprovado/Reprovado/Ajuste Necessário).
    5. Sugira uma micro-ação concreta para melhorar a performance.
    
    Contexto Atual: ${context}
    Dados do Operador: ${JSON.stringify(data)}
    `;

    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash-lite"),
            system: systemPrompt,
            prompt: "Analise este intel e forneça relatório tático.",
        });

        return { success: true, advice: text };
    } catch (error) {
        console.error("Bio-AI Error:", error);
        return { success: false, error: "Falha na comunicação com o Bio-Engine." };
    }
}

export async function logMeal(data: {
  date: Date;
  type: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
  items: string[];
  photoUrl?: string;
  calories?: number;
  protein?: number;
}) {
  const user = await getUser();
  const mealDate = new Date(data.date);
  mealDate.setHours(0, 0, 0, 0);

  // Prisma Enum type safety
  const mealType = data.type as any; 

  // Upsert the meal log
  await (prisma as any).mealLog.upsert({
    where: {
      userId_date_type: {
        userId: user.id,
        date: mealDate,
        type: mealType,
      },
    },
    update: {
      items: data.items,
      photoUrl: data.photoUrl,
      calories: data.calories,
      protein: data.protein,
    },
    create: {
      userId: user.id,
      date: mealDate,
      type: mealType,
      items: data.items,
      photoUrl: data.photoUrl,
      calories: data.calories,
      protein: data.protein,
    },
  });

  revalidatePath("/bio");
  return { success: true };
}

export async function getDailyMeals(date: Date) {
  const user = await getUser();
  const mealDate = new Date(date);
  mealDate.setHours(0, 0, 0, 0);

  const meals = await (prisma as any).mealLog.findMany({
    where: {
      userId: user.id,
      date: mealDate,
    },
  });

  return meals;
}

export async function evaluateNutrition(date: Date) {
  const meals = await getDailyMeals(date);

  if (!meals || meals.length === 0) {
    return { success: false, feedback: "Nenhuma refeição registrada para análise." };
  }

  const prompt = `
    Analise a nutrição do Operador para o dia.
    
    Café da Manhã: ${meals.find((m: MealLog) => m.type === "BREAKFAST")?.items.join(", ") || "Jejum/Não registrado"}
    Almoço: ${meals.find((m: MealLog) => m.type === "LUNCH")?.items.join(", ") || "Não registrado"}
    Jantar: ${meals.find((m: MealLog) => m.type === "DINNER")?.items.join(", ") || "Não registrado"}
    Lanches: ${meals.filter((m: MealLog) => m.type === "SNACK").map((m: MealLog) => m.items.join(", ")).join("; ") || "Nenhum"}
    
    Objetivo: Performance Cognitiva e Física (Hybrid Athlete).
    
    Forneça:
    1. Crítica Direta (O que faltou? O que sobrou?)
    2. Score de Combustível (0-10)
    3. Uma sugestão de ajuste imediato para amanhã.
  `;

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      system: "Você é um Nutricionista Tático do Vanguard Protocol. Responda em PT-BR",
      prompt: prompt,
    });

    return { success: true, feedback: text };
  } catch (error) {
    console.error("AI Nutrition Error:", error);
    return { success: false, feedback: "Erro ao consultar o Nutricionista Tático." };
  }
}


export async function logOutput(data: {
    date: Date;
    stoolType: number;
    stoolColor: string;
    stoolNotes: string;
}) {
    const user = await getUser();
    await (prisma as any).outputLog.create({
        data: {
            userId: user.id,
            date: data.date,
            stoolType: data.stoolType,
            stoolColor: data.stoolColor,
            stoolNotes: data.stoolNotes
        }
    });

    revalidatePath("/bio");
    return { success: true };
}

export async function getDailyOutputs(date: Date) {
    const user = await getUser();
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);
    
    return await (prisma as any).outputLog.findMany({
        where: {
            userId: user.id,
            date: {
                gte: start,
                lte: end
            }
        },
        orderBy: {
            date: 'desc'
        }
    });
}

export async function getOutputStats() {
    const user = await getUser();
    const start = new Date();
    start.setDate(start.getDate() - 14);
    
    return await (prisma as any).outputLog.findMany({
        where: {
            userId: user.id,
            date: { gte: start }
        },
        orderBy: { date: 'asc' }
    });
}
