"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Default configuration if none exists
export const DEFAULT_PROTOCOL_CONFIG = {
    op1: "Hydrate",
    op2: "Mobility",
    st1: "Breath",
    st2: "Reset",
    dip1: "Alignment"
};

const ProtocolConfigSchema = z.object({
    op1: z.string().min(1).max(20),
    op2: z.string().min(1).max(20),
    st1: z.string().min(1).max(20),
    st2: z.string().min(1).max(20),
    dip1: z.string().min(1).max(20),
});

export type ProtocolConfig = z.infer<typeof ProtocolConfigSchema>;

export async function getProtocolConfig(): Promise<ProtocolConfig> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return DEFAULT_PROTOCOL_CONFIG;

    const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { protocolConfig: true }
    });

    if (profile?.protocolConfig) {
        // Parse and validate stored config, falling back to defaults for missing keys
        const parsed = ProtocolConfigSchema.safeParse(profile.protocolConfig);
        if (parsed.success) {
            return parsed.data;
        }
    }

    return DEFAULT_PROTOCOL_CONFIG;
}

export async function updateProtocolConfig(data: ProtocolConfig) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const validated = ProtocolConfigSchema.parse(data);

    await prisma.profile.upsert({
        where: { userId: user.id },
        update: { protocolConfig: validated },
        create: { 
            userId: user.id, 
            protocolConfig: validated
        }
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
}
