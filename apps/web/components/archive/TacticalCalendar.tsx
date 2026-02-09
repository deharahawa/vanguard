"use client";

import { clsx } from "clsx";
import type { CalendarDay } from "@/actions/history";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TacticalCalendarProps {
  data: CalendarDay[];
  year: number;
  month: number; // 1-12
}

export function TacticalCalendar({ data, year, month }: TacticalCalendarProps) {
  const router = useRouter();
  
  // Calculate grid padding
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Create array for grid
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrev = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
    }
    router.push(`/archive?year=${newYear}&month=${newMonth}`);
  };

  const handleNext = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
    }
    router.push(`/archive?year=${newYear}&month=${newMonth}`);
  };

  const monthName = new Date(year, month - 1).toLocaleString('en-US', { month: 'long' });

  return (
    <div className="w-full max-w-4xl bg-zinc-950 border border-zinc-900 rounded-xl p-8 space-y-8 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-4">
           {monthName} <span className="text-zinc-600">{year}</span>
        </h2>
        <div className="flex gap-2">
            <button onClick={handlePrev} className="p-2 hover:bg-zinc-900 rounded transition-colors text-zinc-400 hover:text-white">
                <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-zinc-900 rounded transition-colors text-zinc-400 hover:text-white">
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest py-2">
                {day}
            </div>
        ))}

        {/* Padding */}
        {padding.map(p => (
            <div key={`pad-${p}`} className="aspect-square" />
        ))}

        {/* Days */}
        {days.map(day => {
            // Fix: Simple date compare might fail due to timezone if not careful. 
            // The server action returns ISO strings.
            // Let's try to find matching date using string comparison which is safer for YYYY-MM-DD
            // But server returns full ISO. 
            // Better to just match day/month/year.
            const log = data.find(d => {
                const dDate = new Date(d.date);
                return dDate.getDate() === day && dDate.getMonth() === month - 1 && dDate.getFullYear() === year;
            });

            return (
                <DayCell key={day} day={day} log={log} />
            );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex gap-6 justify-center pt-4 text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-yellow-500 bg-yellow-500/10 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.2)]"></div>
            <span>Elite (80%+)</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-zinc-700 bg-zinc-800/50 rounded-sm"></div>
            <span>Standard (50%+)</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-zinc-900 bg-zinc-950 rounded-sm opacity-50"></div>
            <span>Missed</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
            <span>Intel Log</span>
         </div>
      </div>
    </div>
  );
}

function DayCell({ day, log }: { day: number, log?: CalendarDay }) {
  const adherence = log?.adherence || 0;
  
  // Styles
  const isElite = adherence >= 80;
  const isStandard = adherence >= 50 && adherence < 80;
  const isMissed = !log || adherence < 50;

  return (
    <div className={clsx(
        "aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-all duration-300 group cursor-pointer",
        isElite && "border-yellow-500 bg-yellow-900/10 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:bg-yellow-900/20",
        isStandard && "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900",
        isMissed && "border-zinc-900 bg-zinc-950 opacity-50 hover:opacity-100 hover:border-zinc-800"
    )}>
        <span className={clsx(
            "text-xs font-mono font-bold",
            isElite ? "text-yellow-500" : isStandard ? "text-zinc-400" : "text-zinc-700"
        )}>
            {day}
        </span>
        
        {/* Journal Indicator */}
        {log?.hasJournal && (
            <div className="absolute bottom-2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_5px_#6366f1]" />
        )}
        
        {/* Tooltip (Simple) */}
        {log && (
            <div className="absolute opacity-0 group-hover:opacity-100 -top-8 bg-black border border-zinc-800 px-2 py-1 rounded text-[10px] text-white whitespace-nowrap z-10 pointer-events-none">
                {adherence}% Adherence {log.mood > 0 && `| Mood: ${log.mood}`}
            </div>
        )}
    </div>
  )
}
