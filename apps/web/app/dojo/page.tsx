"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { startDojoRound, DojoAction } from "@/actions/dojo";
import { checkCommsStatus, GateStatus } from "@/actions/gate";
import { ActiveCard } from "@/components/dojo/ActiveCard";
import { AnalogGate } from "@/components/gate/AnalogGate";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DojoPage() {
    const router = useRouter();
    const [round, setRound] = useState(0);
    const [currentAction, setCurrentAction] = useState<DojoAction | null>(null);
    const [loading, setLoading] = useState(true);
    const [gateStatus, setGateStatus] = useState<GateStatus>({ locked: false, ally: null });

    useEffect(() => {
        const init = async () => {
             const status = await checkCommsStatus();
             setGateStatus(status);
             if (!status.locked) {
                 loadRound(0); // Only load round if unlocked
             } else {
                 setLoading(false); // Stop loading if locked
             }
        };
        init();
    }, []);

    const loadRound = async (index: number) => {
        setLoading(true);
        try {
            const action = await startDojoRound(index);
            setCurrentAction(action);
            if (action.type === 'COMPLETE') {
                // Should not happen if logic is correct, but safe guard
            }
        } catch (e) {
            console.error("Dojo Load Failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        const nextRound = round + 1;
        setRound(nextRound);
        loadRound(nextRound);
    };

    const handleMissionComplete = () => {
        router.push("/dashboard");
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">
                    Initiating Neural Link...
                </p>
            </div>
        );
    }

    // Completion State (Shouldn't really be reached via normal flow if we redirect on mission complete, but good fallback)
    if (!currentAction || currentAction.type === 'COMPLETE') {
         return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
                 <ShieldCheck className="w-16 h-16 text-emerald-500" />
                 <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Session Concluded</h1>
                 <p className="text-zinc-400 max-w-md">The neural link has been severed. Your reflections have been archived.</p>
                 <Link href="/dashboard" className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors">
                    Return to Base
                 </Link>
            </div>
         );
    }

    // Render Active Round
    return (
        <AnalogGate initialStatus={gateStatus}>
            <div className="min-h-screen bg-black relative overflow-hidden flex flex-col">
                {/* Background Ambience */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black pointer-events-none" />
                
                {/* Progress Header */}
                <header className="relative z-10 p-6 flex justify-between items-center bg-transparent">
                     <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                            <div 
                                key={i} 
                                className={`h-1 w-8 rounded-full transition-all duration-500 ${i <= round ? 'bg-emerald-500' : 'bg-zinc-800'}`} 
                            />
                        ))}
                     </div>
                     <div className="text-xs font-mono text-zinc-600 uppercase tracking-widest">
                        Round {round + 1} / 4
                     </div>
                </header>

                {/* Main Content Area */}
                <main className="relative z-10 flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        {currentAction && currentAction.type === 'CHALLENGE' ? (
                            <ActiveCard 
                                key={currentAction.id}
                                id={currentAction.id}
                                category={currentAction.category}
                                content={currentAction.content}
                                onNext={handleNext}
                            />
                        ) : currentAction ? (
                            // THE WALL (Action Round)
                            <motion.div 
                                key="wall"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 max-w-2xl mx-auto"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-red-500 font-black text-6xl md:text-8xl tracking-tighter uppercase glitch-text">
                                        THE WALL
                                    </h2>
                                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-[0.2em]">Physical Verification Required</p>
                                </div>

                                <div className="border border-red-900/50 bg-red-950/10 p-8 md:p-12 rounded-2xl w-full backdrop-blur-sm relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors duration-500" />
                                    <h3 className="text-2xl md:text-4xl font-black text-white uppercase relative z-10">
                                        {currentAction.content}
                                    </h3>
                                </div>

                                <button 
                                    onClick={handleMissionComplete}
                                    className="group relative px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] flex items-center gap-3"
                                >
                                    Mission Complete <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </main>
            </div>
        </AnalogGate>
    );
}
