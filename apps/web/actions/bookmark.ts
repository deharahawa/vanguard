"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { IntelCardData } from "@/actions/stream";
import { revalidatePath } from "next/cache";

export async function toggleBookmark(card: IntelCardData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        const existing = await prisma.savedIntel.findUnique({
            where: {
                userId_cardId: {
                    userId: user.id,
                    cardId: card.id
                }
            }
        });

        if (existing) {
            await prisma.savedIntel.delete({
                where: { id: existing.id }
            });
            revalidatePath("/stream");
            return { action: "removed" };
        } else {
            await prisma.savedIntel.create({
                data: {
                    userId: user.id,
                    cardId: card.id,
                    category: card.category,
                    title: card.title,
                    content: card.content,
                    referenceUrl: card.referenceUrl,
                    color: card.color
                }
            });
            revalidatePath("/stream");
            return { action: "saved" };
        }
    } catch (error) {
        console.error("Bookmark Error:", error);
        return { error: "Failed to update bookmark" };
    }
}

export async function getSavedIntelIds() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const saved = await prisma.savedIntel.findMany({
        where: { userId: user.id },
        select: { cardId: true }
    });

    return saved.map(s => s.cardId);
}
