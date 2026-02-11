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

export async function fetchIntelBatch(batchIndex: number): Promise<FetchResult> {
    // 1. Guard Clause: Strict Limit
    if (batchIndex >= 3) {
        return { 
            cards: [], 
            stop: true, 
            message: "DAILY INTEL LIMIT REACHED. DISENGAGE." 
        };
    }

    try {
        // 2. AI Generation
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

        return {
            cards: object.cards,
            stop: false
        };

    } catch (error) {
        console.error("Intel Generation Failed:", error);
        return {
            cards: [],
            stop: false, // Allow retry? Or fail safe.
            message: "COMMS INTERFERENCE. RETRY."
        };
    }
}
