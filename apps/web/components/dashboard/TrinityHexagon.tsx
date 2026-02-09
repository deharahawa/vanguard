"use client";

import { motion } from "framer-motion";
import { type TrinityStats } from "@/actions/stats";
import { useEffect, useState } from "react";

export function TrinityHexagon({ stats }: { stats: TrinityStats | null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!stats) return null;

  // Normalized values (0-100) -> Scaled to Radius (0-80)
  // Max radius 80 to leave room for labels
  const scale = 0.8; 
  const opR = stats.operator * scale;
  const stcR = stats.stoic * scale;
  const dipR = stats.diplomat * scale;

  /*
    Coordinates Calculation:
    Center: 100, 100
    
    Operator (Top): 90 degrees
    x = 100 + r * cos(90) = 100
    y = 100 - r * sin(90) = 100 - r

    Stoic (Bottom Right): 330 degrees (-30)
    x = 100 + r * cos(330) = 100 + r * 0.866
    y = 100 - r * sin(330) = 100 - r * (-0.5) = 100 + r * 0.5

    Diplomat (Bottom Left): 210 degrees
    x = 100 + r * cos(210) = 100 + r * (-0.866)
    y = 100 - r * sin(210) = 100 - r * (-0.5) = 100 + r * 0.5

    Note: SVG Y coordinates go down.
    Standard Unit Circle: 0 is Right, 90 is Up.
    SVG: 0 is Right, 90 is Down.
    
    So:
    Operator (Top): -90 deg (270)
    Stoic (Bottom Right): 30 deg
    Diplomat (Bottom Left): 150 deg
  */
  
  // Angle definitions in Radians for SVG trig
  const ANGLES = {
      OP: -Math.PI / 2, // -90 deg
      ST: Math.PI / 6,  // 30 deg
      DP: (5 * Math.PI) / 6 // 150 deg
  };

  const getPoints = (r1: number, r2: number, r3: number) => {
      const p1 = { x: 100 + r1 * Math.cos(ANGLES.OP), y: 100 + r1 * Math.sin(ANGLES.OP) };
      const p2 = { x: 100 + r2 * Math.cos(ANGLES.ST), y: 100 + r2 * Math.sin(ANGLES.ST) };
      const p3 = { x: 100 + r3 * Math.cos(ANGLES.DP), y: 100 + r3 * Math.sin(ANGLES.DP) };
      return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  };

  const targetPoints = getPoints(opR, stcR, dipR);
  const zeroPoints = getPoints(0, 0, 0);

  // Background Grid (Triangle) - Max Size (Radius 80)
  const maxPoints = getPoints(80, 80, 80);
  const midPoints = getPoints(40, 40, 40);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Labels */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-xs text-amber-500 tracking-widest">OPR</div>
        <div className="absolute bottom-4 right-4 font-black text-xs text-indigo-500 tracking-widest">STC</div>
        <div className="absolute bottom-4 left-4 font-black text-xs text-emerald-500 tracking-widest">DIP</div>

        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            {/* Grid Lines */}
            <polygon points={maxPoints} fill="none" stroke="#27272a" strokeWidth="1" />
            <polygon points={midPoints} fill="none" stroke="#27272a" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Axis Lines */}
            <line x1="100" y1="100" x2="100" y2="20" stroke="#27272a" strokeWidth="1" />
            <line x1="100" y1="100" x2="169.28" y2="140" stroke="#27272a" strokeWidth="1" />
            <line x1="100" y1="100" x2="30.72" y2="140" stroke="#27272a" strokeWidth="1" />

            {/* Dynamic Shape */}
            <defs>
                <linearGradient id="trinityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.6" />
                </linearGradient>
            </defs>

            {mounted && (
                <motion.polygon 
                    initial={{ points: zeroPoints, opacity: 0 }}
                    animate={{ points: targetPoints, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    fill="url(#trinityGradient)"
                    stroke="white"
                    strokeWidth="2"
                    strokeOpacity="0.5"
                />
            )}
            
            {/* Vertices Dots */}
            {mounted && (
                 <>
                    {/* Operator Dot */}
                     <motion.circle 
                        cx={100 + opR * Math.cos(ANGLES.OP)} 
                        cy={100 + opR * Math.sin(ANGLES.OP)}
                        r="3" fill="#f59e0b"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                     />
                    {/* Stoic Dot */}
                     <motion.circle 
                        cx={100 + stcR * Math.cos(ANGLES.ST)} 
                        cy={100 + stcR * Math.sin(ANGLES.ST)} 
                        r="3" fill="#6366f1"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                     />
                    {/* Diplomat Dot */}
                     <motion.circle 
                        cx={100 + dipR * Math.cos(ANGLES.DP)} 
                        cy={100 + dipR * Math.sin(ANGLES.DP)} 
                        r="3" fill="#10b981"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}
                     />
                 </>
            )}

        </svg>

        {/* Center Core */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-[0_0_10px_white]" />
    </div>
  );
}
