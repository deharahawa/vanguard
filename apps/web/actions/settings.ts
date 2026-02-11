"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";

import { DEFAULT_PROTOCOL_CONFIG, ProtocolConfig, ProtocolConfigSchema } from "@/lib/protocol-config";

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
