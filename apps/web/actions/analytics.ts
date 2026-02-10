"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";

export type TrendDataPoint = {
    date: string;
    fullDate: Date;
    mood: number;
    operatorScore: number;
    stoicScore: number;
    diplomatScore: number;
};

export async function getTrendData(days: number = 30): Promise<TrendDataPoint[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = await prisma.dailyMetrics.findMany({
        where: {
            userId: user.id,
            date: {
                gte: startDate
            }
        },
        orderBy: {
            date: 'asc'
        }
    });

    return metrics.map(m => {
        // Calculate scores
        const operatorScore = (m.hydration ? 1 : 0) + (m.mobility ? 1 : 0);
        const stoicScore = (m.breathing ? 1 : 0) + (m.reset ? 1 : 0);
        const diplomatScore = (m.diplomat ? 1 : 0);

        return {
            date: m.date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
            fullDate: m.date,
            mood: m.mood,
            operatorScore,
            stoicScore,
            diplomatScore
        };
    });
}
