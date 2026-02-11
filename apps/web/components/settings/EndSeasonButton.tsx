"use client";

import { useState } from "react";
import { endSeason } from "@/actions/season";
import { toast } from "sonner";
import { useHaptic } from "@/hooks/useHaptic";
import { Hexagon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function EndSeasonButton() {
    const [status, setStatus] = useState<'IDLE' | 'CONFIRM' | 'PROCESSING'>('IDLE');
    const { triggerHaptic } = useHaptic();

    const handleEndSeason = async () => {
        setStatus('PROCESSING');
        try {
            const result = await endSeason();
            if (result.success) {
                toast.success("SEASON ARCHIVED", {
                    description: `Welcome to the new cycle. Service Record updated.`
                });
                triggerHaptic("heavy");
            } else {
                toast.error("FAILED TO ARCHIVE");
                setStatus('IDLE');
            }
        } catch {
            setStatus('IDLE');
            toast.error("SYSTEM ERROR");
        }
    };

    if (status === 'CONFIRM') {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-4"
            >
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest animate-pulse">Confirm Prestige?</span>
                <button 
                    onClick={handleEndSeason}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-red-900/50"
                >
                    EXECUTE
                </button>
                <button 
                    onClick={() => setStatus('IDLE')}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs font-bold uppercase tracking-widest"
                >
                    CANCEL
                </button>
            </motion.div>
        );
    }

    return (
        <button 
            onClick={() => {
                setStatus('CONFIRM');
                triggerHaptic("warning");
            }}
            disabled={status === 'PROCESSING'}
            className="group relative flex items-center gap-2 px-6 py-3 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/50 hover:border-amber-500 text-amber-500 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {status === 'PROCESSING' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Hexagon className="w-4 h-4 fill-amber-500/20 group-hover:rotate-90 transition-transform duration-700" />
            )}
            <span className="text-xs font-black uppercase tracking-widest">
                {status === 'PROCESSING' ? "ARCHIVING..." : "INITIATE PRESTIGE"}
            </span>
        </button>
    );
}
