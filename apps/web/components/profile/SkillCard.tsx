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
  
  const safeCategory = (category || "").trim().toUpperCase();
  
  let colorClass = "bg-zinc-500";
  let borderClass = "border-zinc-700";
  let textClass = "text-zinc-400";
  
  // Fallback: If category is missing/wrong but label explains it
  if (label.toUpperCase() === "STATE CONTROL" && safeCategory !== "STOIC") {
     // Force Stoic for State Control if mismatch
     colorClass = "bg-indigo-500";
     borderClass = "border-indigo-900";
     textClass = "text-indigo-500";
  } else {
    switch (safeCategory) {
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
  }

  return (
    <div className={`p-4 bg-zinc-950 border ${borderClass} rounded-lg relative overflow-hidden group h-full flex flex-col justify-between min-h-[140px]`}>
      {/* Glow Effect */}
      <div className={`absolute -right-4 -top-4 w-16 h-16 ${colorClass} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />

      <div className="flex justify-between items-start gap-2 relative z-10 mb-6">
        <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{category}</span>
            <h3 className={`text-lg font-black uppercase tracking-wider ${textClass} leading-none mt-1`}>{label}</h3>
        </div>
        <div className="text-right shrink-0">
            <span className="text-2xl font-black text-white">LVL {level}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 relative z-10 mt-auto">
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
