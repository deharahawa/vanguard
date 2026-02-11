"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Type definitions for the briefing content
const WisdomSchema = z.object({
  stoic: z.string().describe("A short, punchy Stoic quote or maxim."),
  tactical: z.string().describe("A actionable piece of tactical advice for focus/discipline."),
  gratitude: z.string().describe("A brief, thought-provoking gratitude prompt."),
});

export type WisdomContent = z.infer<typeof WisdomSchema>;

export async function generateDailyBriefing() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Check for existing briefing
  const existingBriefing = await prisma.dailyBriefing.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  if (existingBriefing) {
    const mission = existingBriefing.missionId 
        ? await prisma.backlogItem.findUnique({ where: { id: existingBriefing.missionId } })
        : null;
        
    return {
        ...existingBriefing,
        wisdoms: existingBriefing.wisdoms as WisdomContent,
        mission
    };
  }

  // 2. Generate new briefing
  // 2a. Fetch a random pending backlog item
  const backlogItems = await prisma.backlogItem.findMany({
    where: {
      userId: user.id,
      status: "PENDING",
    },
  });

  let selectedMissionId: string | null = null;
  if (backlogItems.length > 0) {
    const randomIndex = Math.floor(Math.random() * backlogItems.length);
    selectedMissionId = backlogItems[randomIndex].id;
  }

  // 2b. AI Generation
  const { object } = await generateObject({
    model: google("gemini-2.5-flash-lite"),
    schema: WisdomSchema,
    prompt: "Generate 3 short, punchy cards for a tactical morning briefing. 1. Stoic Quote (Ancient wisdom). 2. Tactical Advice (Focus/Discipline). 3. Gratitude Prompt (Brief question).",
  });

  // 2c. Save to DB
  const newBriefing = await prisma.dailyBriefing.create({
    data: {
      userId: user.id,
      date: today,
      wisdoms: object,
      missionId: selectedMissionId,
    },
  });
  
  const mission = selectedMissionId
      ? await prisma.backlogItem.findUnique({ where: { id: selectedMissionId } })
      : null;

  return {
    ...newBriefing,
    wisdoms: object,
    mission
  };
}

export async function markBriefingViewed(briefingId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.dailyBriefing.update({
        where: { id: briefingId },
        data: { viewed: true }
    });
    
    revalidatePath("/");
}

// Backlog Actions

export async function addToBacklog(content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    if (!content.trim()) return;

    await prisma.backlogItem.create({
        data: {
            userId: user.id,
            content: content.trim(),
            status: "PENDING"
        }
    });
    revalidatePath("/void");
    revalidatePath("/missions");
}

export async function getBacklog() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    return await prisma.backlogItem.findMany({
        where: { userId: user.id, status: "PENDING" },
        orderBy: { createdAt: "desc" }
    });
}

export async function deleteBacklogItem(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    
    await prisma.backlogItem.delete({
        where: { id }
    });
    revalidatePath("/void");
    revalidatePath("/missions");
}

export async function completeBacklogItem(id: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.backlogItem.update({
        where: { id },
        data: { status: "COMPLETED" }
    });
    revalidatePath("/void");
    revalidatePath("/missions");
}
