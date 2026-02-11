"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { AllyWithHealth } from "./network";

export type GateStatus = {
    locked: boolean;
    ally: AllyWithHealth | null;
};

export async function checkCommsStatus(): Promise<GateStatus> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { locked: false, ally: null };

    const allies = await prisma.ally.findMany({
        where: { userId: user.id }
    });

    if (allies.length === 0) return { locked: false, ally: null };

    // Find the most neglected ally
    // Rule: Locked if (DaysSince > Frequency)
    // We sort by "Decay Severity" (How many days *past* due)

    const now = new Date();
    const decayingAllies = allies.map((ally) => {
        const diffTime = Math.abs(now.getTime() - ally.lastContact.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const overdueDays = diffDays - ally.frequencyDays;
        
        return {
            ...ally,
            overdueDays,
            health: Math.max(0, Math.round(100 - ((diffDays / ally.frequencyDays) * 100))),
            status: (100 - ((diffDays / ally.frequencyDays) * 100)) < 25 ? 'CRITICAL' : 'STABLE'
        };
    }).filter((a) => a.overdueDays > 0);

    const criticalAlly = decayingAllies.sort((a, b) => b.overdueDays - a.overdueDays)[0];

    if (criticalAlly) {
        return {
            locked: true,
            ally: {
                ...criticalAlly,
                status: 'CRITICAL' // Ensure type compatibility
            } as AllyWithHealth
        };
    }

    return { locked: false, ally: null };
}
