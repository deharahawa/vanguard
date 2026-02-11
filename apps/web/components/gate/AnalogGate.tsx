"use client";

import { GateStatus } from "@/actions/gate";
import { logInteraction } from "@/actions/network";
import { useState } from "react";
import { motion } from "framer-motion";
import { WifiOff, Phone, ArrowRight, Skull } from "lucide-react";
import { toast } from "sonner";

export function AnalogGate({ 
    children, 
    initialStatus 
}: { 
    children: React.ReactNode, 
    initialStatus: GateStatus 
}) {
    const [status, setStatus] = useState<GateStatus>(initialStatus);
    const [bypassed, setBypassed] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!status.locked || !status.ally || bypassed) {
        return <>{children}</>;
    }

    const handleRestore = async () => {
        if (!status.ally) return;
        setLoading(true);
        
        // Open Protocol (WhatsApp/Phone)
        if (status.ally.contactMethod) {
            window.open(status.ally.contactMethod, '_blank');
        }

        try {
            // Log Interaction immediately
            await logInteraction(status.ally.id);
            toast.success("CONNECTION SIGNAL RESTORED", {
                description: `Decay halted for ${status.ally.name}.`
            });
            setTimeout(() => {
                setStatus({ locked: false, ally: null });
            }, 1000); // Small delay for effect
        } catch {
            toast.error("SIGNAL FAILURE");
            setLoading(false);
        }
    };

    const handleIgnore = () => {
        toast("SOCIAL PROTOCOLS IGNORED", {
            description: "Diplomat XP Penalized.",
            action: {
                label: "Proceed",
                onClick: () => {}
            }
        });
        setBypassed(true);
    };

    return (
        <div className="relative min-h-screen">
            {/* Blurred Content */}
            <div className="absolute inset-0 filter blur-xl opacity-20 pointer-events-none overflow-hidden h-screen">
                {children}
            </div>

            {/* The Gate Overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
                <div className="max-w-md w-full space-y-8 text-center">
                    
                    {/* Icon */}
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-red-950/30 rounded-full flex items-center justify-center mx-auto border border-red-900/50 relative"
                    >
                        <div className="absolute inset-0 rounded-full animate-ping bg-red-900/20" />
                        <WifiOff className="w-10 h-10 text-red-500" />
                    </motion.div>

                    {/* Warning Text */}
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-red-500 tracking-tighter uppercase glitch-text">
                            Access Denied
                        </h1>
                        <p className="text-red-400/80 font-mono text-xs uppercase tracking-widest">
                            Social Protocols Critical. Signal Lost.
                        </p>
                    </div>

                    {/* Ally Card */}
                    <div className="bg-zinc-900/50 border border-red-900/50 p-6 rounded-xl text-left space-y-4 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Skull className="w-12 h-12 text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Target Entity</p>
                            <h2 className="text-2xl font-bold text-white">{status.ally.name}</h2>
                            <p className="text-xs text-zinc-400">{status.ally.role}</p>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex gap-4">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Status</p>
                                <p className="text-red-500 font-black text-sm">CRITICAL</p>
                            </div>
                             <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Protocol</p>
                                <p className="text-zinc-300 font-mono text-sm">Every {status.ally.frequencyDays}d</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={handleRestore}
                            disabled={loading}
                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                        >
                            <Phone size={16} />
                            {loading ? "Re-establishing..." : "Restore Comms"}
                        </button>

                        <button
                            onClick={handleIgnore}
                            className="w-full py-3 text-zinc-600 hover:text-zinc-400 font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                        >
                            Ignore Warning <ArrowRight size={10} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
