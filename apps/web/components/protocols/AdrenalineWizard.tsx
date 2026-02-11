"use client";

import { useState } from "react";
import { Check, X, Droplet, Flame, Activity, Wind } from "lucide-react";
import { useHaptic } from "@/hooks/useHaptic";
import { logAdrenalineProtocol } from "@/actions/protocol";
import { toast } from "sonner";
import { clsx } from "clsx";

interface AdrenalineWizardProps {
    onClose: () => void;
}

const STEPS = [
    {
        id: "hydraulics",
        title: "HYDRAULICS",
        instruction: "INGEST 500ML WATER",
        subtext: "RE-PRESSURIZE THE SYSTEM",
        icon: Droplet,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        border: "border-blue-500/30"
    },
    {
        id: "thermal",
        title: "THERMAL SHOCK",
        instruction: "SPLASH COLD WATER ON FACE",
        subtext: "TRIGGER NOREPINEPHRINE",
        icon: Flame,
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/30"
    },
    {
        id: "kinetics",
        title: "KINETICS",
        instruction: "15 JUMPING JACKS",
        subtext: "SPIKE HEART RATE",
        icon: Activity,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/30"
    },
    {
        id: "ventilation",
        title: "VENTILATION",
        instruction: "10 PHYSIOLOGICAL SIGHS",
        subtext: "MAXIMUM OXYGENATION",
        icon: Wind,
        color: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/30"
    }
];

export function AdrenalineWizard({ onClose }: AdrenalineWizardProps) {
    const { triggerHaptic } = useHaptic();
    const [stepIndex, setStepIndex] = useState(0);
    const [isComplete, setIsComplete] = useState(false);

    const currentStep = STEPS[stepIndex];
    const isLastStep = stepIndex === STEPS.length - 1;

    const handleConfirm = async () => {
        triggerHaptic("heavy");
        
        if (isLastStep) {
            setIsComplete(true);
            const result = await logAdrenalineProtocol();
            if (result.success) {
                toast.success("PROTOCOL COMPLETE", {
                    description: `SYSTEM REBOOTED. +${result.xpGained} XP`,
                    duration: 4000
                });
                triggerHaptic("success");
                setTimeout(onClose, 1500);
            }
        } else {
            setStepIndex(prev => prev + 1);
        }
    };

    if (isComplete) {
        return (
            <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce shadow-[0_0_30px_#22c55e]">
                    <Check size={48} className="text-black" />
                </div>
                <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 text-center">SYSTEM ONLINE</h1>
                <p className="text-green-500 font-mono text-sm uppercase tracking-widest animate-pulse">OPTIMAL PERFORMANCE RESTORED</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header / Progress */}
            <header className="p-6 flex justify-between items-center border-b border-zinc-900">
                <div className="flex gap-2">
                    {STEPS.map((_, i) => (
                        <div 
                            key={i} 
                            className={clsx(
                                "w-8 h-1 rounded-full transition-all duration-300", 
                                i === stepIndex ? "bg-white shadow-[0_0_10px_white]" : i < stepIndex ? "bg-zinc-600" : "bg-zinc-900" 
                            )} 
                        />
                    ))}
                </div>
                <button onClick={onClose} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white">
                    <X size={20} />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8 relative overflow-hidden">
                {/* Background Pulse Effect */}
                <div className={clsx("absolute inset-0 opacity-10 blur-3xl rounded-full scale-150 animate-pulse", currentStep.bg)} />

                <div className={clsx("w-24 h-24 rounded-full flex items-center justify-center border-2 mb-4 transition-all duration-500 shadow-[0_0_30px_currentColor]", currentStep.color, currentStep.bg, currentStep.border)}>
                    <currentStep.icon size={48} className={currentStep.color} />
                </div>

                <div className="space-y-2 z-10">
                    <h2 className={clsx("text-sm font-bold uppercase tracking-[0.2em] mb-4 opacity-70", currentStep.color)}>
                        STEP {stepIndex + 1} {/* {currentStep.id.toUpperCase()} */}
                    </h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                        {currentStep.instruction}
                    </h1>
                    <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-4">
                        {currentStep.subtext}
                    </p>
                </div>
            </main>

            {/* Footer Action */}
            <footer className="p-8 border-t border-zinc-900 bg-zinc-950">
                <button 
                    onClick={handleConfirm}
                    className="w-full py-6 bg-white hover:bg-zinc-200 text-black font-black text-xl italic uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
                >
                    {isLastStep ? "SYSTEM REBOOT" : "CONFIRM STEP"}
                </button>
            </footer>
        </div>
    );
}
