"use client";

import { useHaptic } from "@/hooks/useHaptic";
import { CheckCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export function CompleteMissionButton() {
    const { triggerHaptic } = useHaptic();
    const { pending } = useFormStatus();

    return (
        <button 
            type="submit" 
            onClick={() => triggerHaptic("success")}
            disabled={pending}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 shadow-lg shadow-red-900/20 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <CheckCircle size={16} /> {pending ? "Completing..." : "Mark Complete"}
        </button>
    );
}
