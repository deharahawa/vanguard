"use client";

import { useState } from "react";
import { TacticalCalendar } from "@/components/archive/TacticalCalendar";
import { MoodTrendChart } from "@/components/analytics/MoodTrendChart";
import { TrinityBarChart } from "@/components/analytics/TrinityBarChart";
import type { CalendarDay } from "@/actions/history";
import type { TrendDataPoint } from "@/actions/analytics";
import { Calendar, Activity, Info } from "lucide-react";
import { clsx } from "clsx";

type ViewMode = "CALENDAR" | "WAR_ROOM";

interface ArchiveInterfaceProps {
    calendarData: CalendarDay[];
    trendData: TrendDataPoint[];
    year: number;
    month: number;
}

export function ArchiveInterface({ calendarData, trendData, year, month }: ArchiveInterfaceProps) {
    const [view, setView] = useState<ViewMode>("CALENDAR");

    // Calculate Correlation Insight
    const highOperatorDays = trendData.filter(d => d.operatorScore === 2);
    const avgMoodHighOp = highOperatorDays.length > 0 
        ? highOperatorDays.reduce((acc, curr) => acc + curr.mood, 0) / highOperatorDays.length
        : 0;
    
    const lowOperatorDays = trendData.filter(d => d.operatorScore < 2);
    const avgMoodLowOp = lowOperatorDays.length > 0
        ? lowOperatorDays.reduce((acc, curr) => acc + curr.mood, 0) / lowOperatorDays.length
        : 0;
    
    const diff = avgMoodHighOp - avgMoodLowOp;
    const correlationText = diff > 0 
        ? `High Operator performance correlates with +${diff.toFixed(1)} Mood increase.`
        : "No significant correlation detected yet.";

    return (
        <div className="space-y-8 w-full max-w-4xl">
            {/* Tab Navigation */}
            <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-lg w-fit border border-zinc-800">
                <button 
                    onClick={() => setView("CALENDAR")}
                    className={clsx(
                        "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        view === "CALENDAR" ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <Calendar size={14} /> Tactical Calendar
                </button>
                <button 
                    onClick={() => setView("WAR_ROOM")}
                    className={clsx(
                        "px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all",
                        view === "WAR_ROOM" ? "bg-amber-900/20 text-amber-500 border border-amber-900/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]" : "text-zinc-500 hover:text-zinc-300"
                    )}
                >
                    <Activity size={14} /> War Room
                </button>
            </div>

            {/* View Content */}
            {view === "CALENDAR" ? (
                <TacticalCalendar data={calendarData} year={year} month={month} />
            ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Linear Velocity (Mood) */}
                        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-4">
                            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Mood Velocity (30 Days)</h3>
                            <MoodTrendChart data={trendData} />
                        </div>

                        {/* Sector Performance */}
                        <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-xl space-y-4">
                            <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Sector Performance</h3>
                            <TrinityBarChart data={trendData} />
                        </div>
                    </div>

                    {/* Auto-Generated Insight */}
                    <div className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-purple-900/20 rounded-lg text-purple-400">
                            <Info size={18} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Tactical Insight</h4>
                            <p className="text-zinc-400 text-xs font-mono leading-relaxed">
                                {correlationText}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
