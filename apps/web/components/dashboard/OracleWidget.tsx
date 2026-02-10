"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ScrollText, CheckCircle, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";
import { drawOracleCard, acknowledgeOracle } from "@/actions/oracle";

type OracleCard = {
  id: string;
  content: string;
  author: string | null;
  category: string;
};

export function OracleWidget() {
  const [card, setCard] = useState<OracleCard | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConsult = async () => {
    setIsLoading(true);
    try {
      const drawnCard = await drawOracleCard();
      if (drawnCard) {
        setCard(drawnCard);
        setIsOpen(true);
      } else {
        toast.error("The Oracle is silent. (No cards found)");
      }
    } catch {
      toast.error("Failed to consult the Oracle.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledge = async () => {
    try {
      const result = await acknowledgeOracle();
      if (result.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ffffff", "#a855f7", "#3b82f6"],
        });

        toast.success(`Wisdom Integrated. +${result.xpAdded} XP (Stoic)`);
        
        if (result.levelUp) {
          toast(result.levelUp, {
            icon: <Sparkles className="text-yellow-400" />,
            style: { borderColor: "#facc15" },
          });
        }
        
        setIsOpen(false);
        setTimeout(() => setCard(null), 500); // Clear after animation
      }
    } catch {
      toast.error("Failed to acknowledge.");
    }
  };

  const handleJournal = () => {
    if (!card) return;
    router.push(`/chronicle?entry=${encodeURIComponent(`Reflection on: "${card.content}" - ${card.author || 'Unknown'}\n\n`)}`);
  };

  return (
    <div className="w-full max-w-md mx-auto perspective-1000 h-64 relative flex justify-center items-center my-8">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="card-back"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 180 }}
            transition={{ duration: 0.6 }}
            onClick={handleConsult}
            disabled={isLoading}
            className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-zinc-700 hover:shadow-2xl hover:shadow-purple-900/20 transition-all group cursor-pointer"
          >
            <div className="p-4 rounded-full bg-zinc-950 border border-zinc-800 group-hover:border-purple-500/50 transition-colors">
              <BrainCircuit className={`w-8 h-8 text-zinc-500 group-hover:text-purple-400 transition-colors ${isLoading ? 'animate-pulse' : ''}`} />
            </div>
            <span className="text-zinc-500 font-mono text-sm tracking-widest uppercase group-hover:text-zinc-300 transition-colors">
              {isLoading ? "Consulting..." : "Consult The Oracle"}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="card-front"
            initial={{ opacity: 0, rotateY: -180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            {/* Content */}
            <div className="flex flex-col gap-4 z-10">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">{card?.category}</span>
                    <Sparkles className="w-4 h-4 text-purple-500/50" />
                </div>
                
                <blockquote className="text-lg md:text-xl font-medium text-zinc-100 leading-relaxed font-serif italic">
                    &quot;{card?.content}&quot;
                </blockquote>
                
                <p className="text-sm text-zinc-500 font-mono text-right">
                    — {card?.author || "Unknown"}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 z-10 mt-auto pt-4">
                <button 
                    onClick={handleAcknowledge}
                    className="flex-1 bg-zinc-100 text-black h-10 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-colors"
                >
                    <CheckCircle size={14} /> Acknowledge
                </button>
                <button 
                    onClick={handleJournal}
                    className="flex-1 bg-zinc-900 text-zinc-300 border border-zinc-800 h-10 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                    <ScrollText size={14} /> Journal
                </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
