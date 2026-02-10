import { generateDailyBriefing } from "@/actions/briefing";
import { Sparkles, Target, Quote } from "lucide-react";
import { OracleWidget } from "@/components/dashboard/OracleWidget";

export default async function BriefingPage() {
    const briefing = await generateDailyBriefing();

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-32">
            <header className="mb-8 flex justify-between items-center">
                <div>
                     <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-white">The Oracle</h1>
                     <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">System Intelligence</p>
                </div>
            </header>

            <div className="max-w-4xl mx-auto grid gap-8">
                 {/* Daily Wisdom Cards */}
                 <section className="grid md:grid-cols-3 gap-4">
                    <QuoteCard 
                        title="Stoic" 
                        icon={<Quote size={18} />} 
                        content={briefing.wisdoms.stoic} 
                        borderColor="border-zinc-700" 
                    />
                    <QuoteCard 
                        title="Tactical" 
                        icon={<Target size={18} />} 
                        content={briefing.wisdoms.tactical} 
                        borderColor="border-purple-900/50" 
                    />
                    <QuoteCard 
                        title="Gratitude" 
                        icon={<Sparkles size={18} />} 
                        content={briefing.wisdoms.gratitude} 
                        borderColor="border-blue-900/50" 
                    />
                 </section>

                 {/* The Deck */}
                 <section className="flex flex-col items-center gap-4 py-8 border-t border-zinc-900">
                    <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Draw from the Deck</h2>
                    <OracleWidget />
                 </section>
            </div>
        </div>
    );
}

function QuoteCard({ title, icon, content, borderColor }: { title: string, icon: React.ReactNode, content: string, borderColor: string }) {
    return (
        <div className={`flex flex-col gap-4 p-8 bg-zinc-950 border ${borderColor} rounded-2xl relative overflow-hidden group hover:bg-zinc-900/40 transition-colors`}>
             <div className="flex items-center gap-2 text-zinc-500 mb-2">
                {icon}
                <span className="text-xs font-mono uppercase tracking-widest">{title}</span>
            </div>
            <p className="text-zinc-200 font-medium leading-relaxed font-serif text-lg">
                &quot;{content}&quot;
            </p>
        </div>
    );
}
