"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WisdomContent, markBriefingViewed } from "@/actions/briefing";
import { Sparkles, Target, ArrowRight, CheckCircle, Quote } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import confetti from "canvas-confetti";

type BriefingData = {
  id: string;
  wisdoms: WisdomContent;
  mission: { id: string; content: string } | null;
};

export function MorningDossier({ data }: { data: BriefingData }) {
  const [step, setStep] = useState<"WISDOM" | "MISSION">("WISDOM");
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleNext = () => setStep("MISSION");

  const handleAccept = async () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });
    
    toast.success("Protocol Initiated. Target Acquired.");
    setIsVisible(false); // Close overlay locally for smoothness
    
    await markBriefingViewed(data.id);
    router.refresh();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        {step === "WISDOM" ? (
          <motion.div
            key="wisdom"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="max-w-4xl w-full flex flex-col gap-8"
          >
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">Morning Protocol</h2>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">System Intelligence // Online</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <WisdomCard title="Stoic" icon={<Quote />} content={data.wisdoms.stoic} color="border-zinc-700" />
                <WisdomCard title="Tactical" icon={<Target />} content={data.wisdoms.tactical} color="border-purple-900/50" />
                <WisdomCard title="Gratitude" icon={<Sparkles />} content={data.wisdoms.gratitude} color="border-blue-900/50" />
            </div>

            <div className="flex justify-center mt-8">
                <button 
                    onClick={handleNext}
                    className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-wider rounded-full hover:bg-zinc-200 transition-colors"
                >
                    Proceed to Objective <ArrowRight size={16} />
                </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="mission"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full flex flex-col gap-8 items-center text-center"
          >
             <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-red-900/20 flex items-center justify-center border border-red-900/50 animate-pulse">
                    <Target className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Operational Target</h2>
                 <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    One Task. Zero Excuses.
                </p>
            </div>

            <div className="w-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                    {data.mission ? data.mission.content : "No Pending Targets for today."}
                </h3>
            </div>

             <button 
                onClick={handleAccept}
                className="flex items-center gap-2 px-12 py-4 bg-red-600 text-white font-black uppercase tracking-widest rounded-lg hover:bg-red-700 transition-all hover:scale-105 shadow-lg shadow-red-900/20"
            >
                <CheckCircle size={20} />
                Accept Mission
            </button>
            
            <p className="text-zinc-600 text-xs text-center max-w-xs mx-auto mt-4">
                Complete this objective to maintain momentum.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WisdomCard({ title, icon, content, color }: { title: string, icon: React.ReactNode, content: string, color: string }) {
    return (
        <div className={`flex flex-col gap-4 p-6 bg-zinc-950 border ${color} rounded-xl hover:bg-zinc-900/50 transition-colors`}>
            <div className="flex items-center gap-2 text-zinc-400 mb-2">
                {icon}
                <span className="text-xs font-mono uppercase tracking-widest">{title}</span>
            </div>
            <p className="text-zinc-100 font-medium leading-relaxed">
                {content}
            </p>
        </div>
    );
}
