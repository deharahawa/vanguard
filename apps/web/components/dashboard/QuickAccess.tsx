import Link from "next/link";
import { Sparkles, Archive, Settings, ArrowUpRight } from "lucide-react";

export function QuickAccess() {
    const items = [
        { label: "Oracle", href: "/briefing", icon: Sparkles, color: "text-purple-500", border: "border-purple-900/50" },
        { label: "Archive", href: "/archive", icon: Archive, color: "text-amber-500", border: "border-amber-900/50" },
        { label: "Control", href: "/settings", icon: Settings, color: "text-zinc-500", border: "border-zinc-900" },
    ];

    return (
        <div className="grid grid-cols-3 gap-4 w-full">
            {items.map((item) => (
                <Link 
                    key={item.label} 
                    href={item.href}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-zinc-900/50 border ${item.border} hover:bg-zinc-900 hover:scale-105 transition-all group relative overflow-hidden`}
                >
                    <div className={`p-2 rounded-full bg-black/50 ${item.color}`}>
                        <item.icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                        {item.label}
                    </span>
                    <ArrowUpRight className="absolute top-2 right-2 w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            ))}
        </div>
    );
}
