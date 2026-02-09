"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { clsx } from "clsx";

interface SecureContentProps {
  children: React.ReactNode;
}

export function SecureContent({ children }: SecureContentProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-lg group">
      {/* The Content (Blurred by default) */}
      <div className={clsx("transition-all duration-500", isRevealed ? "blur-0" : "blur-md select-none")}>
        {children}
      </div>

      {/* The Interaction Overlay */}
      {!isRevealed && (
        <div 
            onClick={() => setIsRevealed(true)}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/50 cursor-pointer backdrop-grayscale hover:bg-zinc-950/40 transition-colors"
        >
            <Lock className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-zinc-300 transition-colors" />
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest group-hover:text-zinc-300 transition-colors">
                Confidential // Tap to Decrypt
            </span>
        </div>
      )}
    </div>
  );
}
