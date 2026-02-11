"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export type IntelCardData = {
    id: string;
    category: 'TECH' | 'STRATEGY' | 'INTEL' | 'CURIOSITY';
    title: string;
    content: string;
    referenceUrl?: string;
    color: string;
};

export type FetchResult = {
    cards: IntelCardData[];
    stop: boolean;
    message?: string;
};

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";

export async function fetchIntelBatch(batchIndex: number): Promise<FetchResult> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Guard Clause: Strict Limit
    if (batchIndex >= 3) {
        return { 
            cards: [], 
            stop: true, 
            message: "DAILY INTEL LIMIT REACHED. DISENGAGE." 
        };
    }

    if (!user) {
        return { cards: [], stop: true, message: "UNAUTHORIZED ACCESS." };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Check Cache
    const cachedBatch = await prisma.dailyStreamCache.findUnique({
        where: {
            userId_date_batchIndex: {
                userId: user.id,
                date: today,
                batchIndex
            }
        }
    });

    if (cachedBatch) {
        // Parse JSON safely
        const cards = typeof cachedBatch.cards === 'string' 
            ? JSON.parse(cachedBatch.cards) 
            : cachedBatch.cards as IntelCardData[];
            
        return {
            cards,
            stop: false
        };
    }

    try {
        // 3. AI Generation
        const { object } = await generateObject({
            model: google("gemini-2.5-flash-lite"),
            schema: z.object({
                cards: z.array(z.object({
                    id: z.string(),
                    category: z.enum(['TECH', 'STRATEGY', 'INTEL', 'CURIOSITY']),
                    title: z.string(),
                    content: z.string(),
                    referenceUrl: z.string().optional(),
                    color: z.string()
                }))
            }),
            prompt: `
                Generate 10 unique, short, punchy 'Intel Cards' as a JSON array.
                Mix these categories randomly:
                1. TECH: Recent AI/Tech breakdown or tool recommendation.
                2. STRATEGY: A law of power, stoic maxim, or strategic mental model (Robert Greene style).
                3. INTEL: A significant recent global event or trend (last 48h context is preferred if possible, otherwise timeless strategic context).
                4. CURIOSITY: A scientific fact or historical anomaly.

                Constraints:
                - Content must be maximum 2 sentences. Very concise.
                - Colors: TECH(#06b6d4), STRATEGY(#eab308), INTEL(#f97316), CURIOSITY(#a855f7).
                - Tone: Professional, high-bandwidth, 'Operator' aesthetic.
                - referenceUrl: Provide a valid URL to a reputable source (Wikipedia, TechCrunch, etc.) for the topic if available.
            `
        });

        // 4. Cache Result
        await prisma.dailyStreamCache.create({
            data: {
                userId: user.id,
                date: today,
                batchIndex,
                cards: object.cards as any // JSON compatibility
            }
        });

        return {
            cards: object.cards,
            stop: false
        };

    } catch (error) {
        console.error("Intel Generation Failed:", error);
        return {
            cards: [],
            stop: false, // Allow retry based on implementation, or fail safe.
            message: "COMMS INTERFERENCE. RETRY."
        };
    }
}
