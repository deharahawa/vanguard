"use client";

import { Droplet, Wind, Footprints, Zap } from "lucide-react";
import { type WeeklyReport } from "@/actions/chronicle";
import { clsx } from "clsx";
import { SecureContent } from "../ui/SecureContent";

export function ReportCard({ data, briefing }: { data: WeeklyReport, briefing?: string }) {
  const { adherence, averageMood, breakdown, logs, startDate, endDate } = data;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMoodEmoji = (val: number) => {
    if (val >= 4.5) return "⚡";
    if (val >= 3.5) return "🌤️";
    if (val >= 2.5) return "☁️";
    if (val >= 1.5) return "🌧️";
    return "💀";
  };

  return (
    <div className="w-full max-w-4xl p-8 bg-zinc-950 border border-zinc-800 rounded-lg space-y-8 font-mono shadow-2xl">
      {/* Header */}
      <header className="flex justify-between items-end border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-widest uppercase mb-1">
            Weekly Debrief
          </h1>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            Range: {formatDate(startDate)} - {formatDate(endDate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-600 uppercase">Status</p>
          <span className="text-sm font-bold text-emerald-500">COMPLETE</span>
        </div>
      </header>
      
      {/* Mentor Briefing */}
      {briefing && (
        <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="animate-pulse">●</span> Mentor Briefing
            </h3>
            <p className="text-sm text-zinc-300 font-mono leading-relaxed">
                {briefing}
            </p>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Adherence */}
        <div className="bg-zinc-900/50 p-6 rounded-md border border-zinc-800/50 flex flex-col items-center justify-center space-y-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Protocol Adherence</span>
            <span className={clsx("text-6xl font-black tracking-tighter", adherence >= 80 ? "text-yellow-500" : adherence < 50 ? "text-red-500" : "text-zinc-300")}>
                {adherence}%
            </span>
        </div>

        {/* Mood */}
        <div className="bg-zinc-900/50 p-6 rounded-md border border-zinc-800/50 flex flex-col items-center justify-center space-y-2">
             <span className="text-xs text-zinc-500 uppercase tracking-widest">Average Mood</span>
             <span className="text-6xl">{getMoodEmoji(averageMood)}</span>
             <span className="text-xs text-zinc-600 font-bold">{averageMood} / 5.0</span>
        </div>
      </div>

      {/* Protocol Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">
          Sector Analysis
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatBar icon={<Droplet size={14} />} label="Hydration" value={breakdown.hydration} total={7} color="bg-blue-500" />
          <StatBar icon={<Wind size={14} />} label="Breath" value={breakdown.breathing} total={7} color="bg-cyan-500" />
          <StatBar icon={<Footprints size={14} />} label="Mobility" value={breakdown.mobility} total={7} color="bg-emerald-500" />
          <StatBar icon={<Zap size={14} />} label="Reset" value={breakdown.reset} total={7} color="bg-amber-500" />
        </div>
      </div>

      {/* The Narrative */}
      {logs.length > 0 && (
        <div className="space-y-4 pt-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-l-2 border-zinc-500 pl-2">
                Mission Log
            </h3>
            <SecureContent>
                <div className="bg-black border border-zinc-900 rounded p-4 space-y-3 max-h-64 overflow-y-auto">
                    {logs.map((log, i) => (
                        <div key={i} className="text-xs font-mono">
                            <span className="text-zinc-600 mr-3">[{formatDate(log.date)}]</span>
                            <span className="text-zinc-300">{log.summary}</span>
                        </div>
                    ))}
                </div>
            </SecureContent>
        </div>
      )}
    </div>
  );
}

function StatBar({ icon, label, value, total, color }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    total: number;
    color: string;
}) {
  const percentage = Math.round((value / total) * 100);
  return (
    <div className="flex items-center gap-3">
       <div className="p-2 bg-zinc-900 rounded text-zinc-400">{icon}</div>
       <div className="flex-1 space-y-1">
            <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                <span>{label}</span>
                <span>{value}/{total}</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${color}`} 
                    style={{ width: `${percentage}%` }} 
                />
            </div>
       </div>
    </div>
  )
}
