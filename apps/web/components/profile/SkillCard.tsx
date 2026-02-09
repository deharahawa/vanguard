"use client";



interface SkillCardProps {
  label: string;
  level: number;
  xp: number;
  category: "OPERATOR" | "STOIC" | "DIPLOMAT" | string;
}

export function SkillCard({ label, level, xp, category }: SkillCardProps) {
  // Level threshold is 100 XP
  // Progress is xp % 100
  const progress = xp % 100;
  
  let colorClass = "bg-zinc-500";
  let borderClass = "border-zinc-700";
  let textClass = "text-zinc-400";

  switch (category) {
    case "OPERATOR":
      colorClass = "bg-amber-500";
      borderClass = "border-amber-900";
      textClass = "text-amber-500";
      break;
    case "STOIC":
      colorClass = "bg-indigo-500";
      borderClass = "border-indigo-900";
      textClass = "text-indigo-500";
      break;
    case "DIPLOMAT":
      colorClass = "bg-emerald-500";
      borderClass = "border-emerald-900";
      textClass = "text-emerald-500";
      break;
  }

  return (
    <div className={`p-4 bg-zinc-950 border ${borderClass} rounded-lg space-y-3 relative overflow-hidden group`}>
      {/* Glow Effect */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${colorClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

      <div className="flex justify-between items-end relative z-10">
        <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{category}</span>
            <h3 className={`text-lg font-black uppercase tracking-wider ${textClass}`}>{label}</h3>
        </div>
        <div className="text-right">
            <span className="text-2xl font-black text-white">LVL {level}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 relative z-10">
        <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
            <span>XP: {progress}/100</span>
            <span>NEXT LEVEL</span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
                className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
                style={{ width: `${progress}%` }} 
            />
        </div>
      </div>
    </div>
  );
}
