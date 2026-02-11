"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowRight, BrainCircuit, Activity } from "lucide-react";
import { submitReflection } from "@/actions/dojo";
import { toast } from "sonner";

interface ActiveCardProps {
    id: string;
    category: string;
    content: string;
    onNext: () => void;
}

export function ActiveCard({ id, category, content, onNext }: ActiveCardProps) {
    const [status, setStatus] = useState<'IDLE' | 'THINKING' | 'ANALYZING' | 'FEEDBACK'>('IDLE');
    const [reflection, setReflection] = useState("");
    const [feedback, setFeedback] = useState("");

    const handleTransmit = async () => {
        if (!reflection.trim()) return;
        
        setStatus('ANALYZING');
        try {
            // Simulate net lag for effect
            // await new Promise(r => setTimeout(r, 1500)); 
            
            const result = await submitReflection(content, reflection, category, id);
            
            if (result && result.feedback) {
                setFeedback(result.feedback);
                setStatus('FEEDBACK');
            } else {
                toast.error("Transmission Interrupted. Retry.");
                setStatus('IDLE');
            }
        } catch {
            toast.error("System Failure");
            setStatus('IDLE');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 md:p-12 relative min-h-[50vh] flex flex-col justify-center">
            
            <AnimatePresence mode="wait">
                {status !== 'FEEDBACK' ? (
                    <motion.div 
                        key="challenge"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 opacity-50">
                            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-[0.2em]">{category} PROTOCOL</span>
                        </div>

                        {/* Content */}
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                            {content}
                        </h1>

                        {/* Input Area */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                            <div className="relative bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                <textarea
                                    autoFocus
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="Transmit your reflection..."
                                    className="w-full bg-transparent text-white resize-none outline-none min-h-[120px] font-mono text-sm leading-relaxed"
                                    disabled={status === 'ANALYZING'}
                                />
                                <div className="flex justify-between items-center pt-4 border-t border-zinc-900 mt-2">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                        {reflection.length > 0 ? 'LINK ESTABLISHED' : 'AWAITING INPUT'}
                                    </span>
                                    <button
                                        onClick={handleTransmit}
                                        disabled={!reflection.trim() || status === 'ANALYZING'}
                                        className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {status === 'ANALYZING' ? (
                                            <>Analyzing <BrainCircuit className="w-3 h-3 animate-spin" /></>
                                        ) : (
                                            <>Transmit <Send className="w-3 h-3" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="feedback"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8 border-l-2 border-emerald-500 pl-6 md:pl-12 py-4"
                    >
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Operator Log</h3>
                            <p className="text-zinc-400 italic font-serif text-lg">&quot;{reflection}&quot;</p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <BrainCircuit className="w-3 h-3" /> Sensei Analysis
                            </h3>
                            <p className="text-white font-mono text-sm md:text-base leading-relaxed border border-zinc-800 bg-zinc-900/50 p-6 rounded-lg">
                                {feedback}
                            </p>
                        </div>

                        <button
                            onClick={onNext}
                            className="group flex items-center gap-4 text-white hover:text-emerald-400 transition-colors"
                        >
                            <span className="text-sm font-bold uppercase tracking-widest">Next Protocol</span>
                            <div className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
