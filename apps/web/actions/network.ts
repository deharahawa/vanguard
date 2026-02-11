"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";
import { AllyWithHealth, AllyFormData } from "@/types/network";

export { type AllyWithHealth, type AllyFormData }; // Re-export for convenience if needed, but better to import from types

export async function getNetworkStatus(): Promise<AllyWithHealth[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const allies = await prisma.ally.findMany({
        where: { userId: user.id },
        orderBy: { lastContact: 'asc' }
    });

    return allies.map(ally => {
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - ally.lastContact.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        let health = 100 - ((diffDays / ally.frequencyDays) * 100);
        if (health < 0) health = 0;

        let status: 'STABLE' | 'DECAYING' | 'CRITICAL' = 'STABLE';
        if (health < 25) status = 'CRITICAL';
        else if (health < 75) status = 'DECAYING';

        return {
            ...ally,
            health: Math.round(health),
            status
        };
    }).sort((a, b) => a.health - b.health);
}

export async function createAlly(data: AllyFormData) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.ally.create({
            data: {
                userId: user.id,
                name: data.name,
                role: data.role,
                frequencyDays: parseInt(data.frequencyDays.toString()),
                contactMethod: data.contactMethod,
                lastContact: new Date() // Start fresh
            }
        });
        
        revalidatePath('/network');
        return { success: true };
    } catch (error) {
        console.error("Failed to create ally", error);
        return { error: "Failed to create ally" };
    }
}

export async function updateAlly(id: string, data: AllyFormData) {
     try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.ally.update({
            where: { id, userId: user.id },
            data: {
                name: data.name,
                role: data.role,
                frequencyDays: parseInt(data.frequencyDays.toString()),
                contactMethod: data.contactMethod,
            }
        });
        
        revalidatePath('/network');
        return { success: true };
    } catch (error) {
        console.error("Failed to update ally", error);
        return { error: "Failed to update ally" };
    }
}

export async function deleteAlly(id: string) {
    try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        await prisma.ally.delete({
            where: { id, userId: user.id }
        });
        
        revalidatePath('/network');
        return { success: true };
    } catch (error) {
         console.error("Failed to delete ally", error);
        return { error: "Failed to delete ally" };
    }
}

export async function logInteraction(allyId: string) {
    try {
        await prisma.ally.update({
            where: { id: allyId },
            data: { lastContact: new Date() }
        });

        revalidatePath('/network');
        return { success: true };
    } catch (e) {
        console.error("Failed to log interaction", e);
        return { error: "Failed to update network status" };
    }
}
