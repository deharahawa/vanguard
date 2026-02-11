"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type DojoAction = 
    | { type: 'CHALLENGE'; id: string; content: string; category: string }
    | { type: 'MISSION'; id: string; content: string; category: 'THE WALL' }
    | { type: 'COMPLETE' };

export async function startDojoRound(roundIndex: number): Promise<DojoAction> {
    // 4. Round 4: The Wall (Action)
    if (roundIndex === 3) {
        // Fetch a backlog item or generic challenge
        // For now, consistent physical challenge
        return {
            type: 'MISSION',
            id: 'wall-protocol',
            content: "EXECUTE 20 PUSHUPS. IMMEDIATELY.",
            category: 'THE WALL'
        };
    }

    if (roundIndex > 3) return { type: 'COMPLETE' };

    const categories = ['STRATEGY', 'TECH', 'SOUL'];
    const category = categories[roundIndex];

    // 1. Try to fetch from Deck
    const card = await prisma.dojoCard.findFirst({
        where: { category },
        orderBy: { createdAt: 'asc' }
    });

    if (card) {
        return { type: 'CHALLENGE', id: card.id, content: card.content, category: card.category };
    }

    // 2. If Deck empty, Generate on Fly (Sensei Mode)
    try {
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: z.object({
                content: z.string(),
            }),
            prompt: `
                Generate a provocative, single-sentence question or challenge for a high-performance operator.
                Category: ${category}.
                
                Context:
                - STRATEGY: Mental models, war/business strategy (Sun Tzu, Robert Greene).
                - TECH: Future trends, AI adaptation, tool mastery.
                - SOUL: Stoicism, emotional control, purpose (Marcus Aurelius).

                Output: JUST the question. No preamble.
                Example: "If you lost everything today, what skill would rebuild your empire?"
            `
        });

        // Save to DB for consistency (optional, but good for tracking)
        // actually we don't save generated ones to the *deck* to keep deck manually curated potentially,
        // but for now let's just use it ephemerally or save it. 
        // Let's return it directly. 
        
        return { 
            type: 'CHALLENGE', 
            id: `gen-${Date.now()}`, 
            content: object.content, 
            category 
        };

    } catch (e) {
        console.error("Dojo Generation Failed", e);
        return {
             type: 'CHALLENGE',
             id: 'fallback',
             content: "System Offline. What is your immediate protocol?",
             category
        };
    }
}

export async function submitReflection(prompt: string, userText: string, category: string, cardId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        // 1. Analyze with AI
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: z.object({
                feedback: z.string(),
            }),
            prompt: `
                Act as a Tactician/Sensei.
                User was asked: "${prompt}"
                User replied: "${userText}"

                Task: Provide feedback.
                1. Validate their insight (1 sentence).
                2. Challenge them to go deeper or apply it (1 sentence).
                Tone: Professional, military-stoic, concise.
            `
        });

        // 2. Persist Entry
        await prisma.dojoEntry.create({
            data: {
                userId: user.id,
                prompt,
                userResponse: userText,
                aiFeedback: object.feedback,
                category
            }
        });

        // 3. Remove Card from Deck if it wasn't generated
        if (!cardId.startsWith('gen-') && !cardId.startsWith('wall-')) {
             // Check if it exists first to avoid error if multiple people use same db (unlikely for local but good practice)
             // or just ignore error.
             try {
                await prisma.dojoCard.delete({ where: { id: cardId } });
             } catch {
                 // Component might have been deleted already or consistent generated ID
             }
        }

        revalidatePath('/dojo');
        return { feedback: object.feedback };

    } catch (e) {
        console.error("Reflection Submit Failed", e);
        return { error: "Transmission Failed" };
    }
}
