"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";

export type OperationWithProgress = {
    id: string;
    title: string;
    status: string;
    deadline: Date | null;
    createdAt: Date;
    progress: number;
    tasks: {
        id: string;
        content: string;
        status: string;
    }[];
};

export async function getOperations(): Promise<OperationWithProgress[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    let operations = await prisma.operation.findMany({
        where: { 
            userId: user.id,
            status: 'ACTIVE'
        },
        include: {
            tasks: true
        },
        orderBy: { createdAt: 'desc' }
    });

    // Seed if empty (Demo)
    if (operations.length === 0) {
        const op = await prisma.operation.create({
            data: {
                userId: user.id,
                title: "Operation: Deep Work System",
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
                tasks: {
                    create: [
                        { content: "Audit current distractions", userId: user.id, status: "COMPLETED" },
                        { content: "Design morning protocol", userId: user.id, status: "PENDING" },
                        { content: "Test new schedule 3 days", userId: user.id, status: "PENDING" }
                    ]
                }
            },
            include: { tasks: true }
        });
        operations = [op];
    }

    return operations.map(op => {
        const total = op.tasks.length;
        const completed = op.tasks.filter(t => t.status === 'COMPLETED').length;
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

        return {
            id: op.id,
            title: op.title,
            status: op.status,
            deadline: op.deadline,
            createdAt: op.createdAt,
            progress,
            tasks: op.tasks.map(t => ({
                id: t.id,
                content: t.content,
                status: t.status
            }))
        };
    });
}

export async function createOperation(title: string, deadline?: Date) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.operation.create({
            data: {
                userId: user.id,
                title,
                deadline,
                status: 'ACTIVE'
            }
        });
        revalidatePath('/missions');
        return { success: true };
    } catch {
        return { error: "Failed to init operation" };
    }
}

export async function completeOperation(id: string) {
    try {
        await prisma.operation.update({
            where: { id },
            data: { status: 'COMPLETED' }
        });
        
        // Add XP logic here if gamification ready
        
        revalidatePath('/missions');
        return { success: true };
    } catch {
        return { error: "Failed to complete operation" };
    }
}

export async function updateOperation(id: string, data: { title: string; deadline?: Date }) {
    try {
        await prisma.operation.update({
            where: { id },
            data: {
                title: data.title,
                deadline: data.deadline
            }
        });
        revalidatePath('/missions');
        return { success: true };
    } catch {
        return { error: "Failed to update operation" };
    }
}

export async function deleteOperation(id: string) {
    try {
        // Unlink tasks first (optional, Prisma might handle cascade if configured, but let's be safe for "SET NULL" behavior)
        await prisma.backlogItem.updateMany({
            where: { operationId: id },
            data: { operationId: null }
        });

        await prisma.operation.delete({
            where: { id }
        });
        revalidatePath('/missions');
        return { success: true };
    } catch {
        return { error: "Failed to delete operation" };
    }
}

export async function assignTaskToOperation(taskId: string, operationId: string) {
    try {
        await prisma.backlogItem.update({
            where: { id: taskId },
            data: { operationId }
        });
        revalidatePath('/missions');
        return { success: true };
    } catch {
        return { error: "Failed to assign task" };
    }
}

export async function removeTaskFromOperation(taskId: string) {
    try {
        await prisma.backlogItem.update({
            where: { id: taskId },
            data: { operationId: null }
        });
        revalidatePath('/missions');
        return { success: true };
    } catch {
        return { error: "Failed to remove task" };
    }
}
