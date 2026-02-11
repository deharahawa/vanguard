import { z } from "zod";

// Default configuration if none exists
export const DEFAULT_PROTOCOL_CONFIG = {
    op1: "Hydrate",
    op2: "Mobility",
    st1: "Breath",
    st2: "Reset",
    dip1: "Alignment"
};

export const ProtocolConfigSchema = z.object({
    op1: z.string().min(1).max(20),
    op2: z.string().min(1).max(20),
    st1: z.string().min(1).max(20),
    st2: z.string().min(1).max(20),
    dip1: z.string().min(1).max(20),
});

export type ProtocolConfig = z.infer<typeof ProtocolConfigSchema>;
