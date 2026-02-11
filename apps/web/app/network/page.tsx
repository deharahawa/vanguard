"use client";

import { useEffect, useState } from "react";
import { getNetworkStatus } from "@/actions/network";
import { AllyWithHealth } from "@/types/network";
import { AllyCard } from "@/components/network/AllyCard";
import { Users, Loader2 } from "lucide-react";
import { AllyForm } from "@/components/network/AllyForm";

export default function NetworkPage() {
    const [allies, setAllies] = useState<AllyWithHealth[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await getNetworkStatus();
                setAllies(data);
            } catch (e) {
                console.error("Failed to load network", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24 md:p-12">
            <header className="mb-12 space-y-4">
                <div className="flex items-center gap-3 opacity-50">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em]">Slice 20: The Network</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase glitch-text">
                    Tactical CRM
                </h1>
                <p className="text-zinc-400 max-w-xl text-lg font-serif">
                    Maintain the signal. Silence is decay. Determine who matters and keep the line open.
                </p>
            </header>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allies.map((ally) => (
                        <AllyCard key={ally.id} ally={ally} />
                    ))}
                    
                    <button 
                        onClick={() => setShowAdd(true)}
                        className="border border-zinc-800 border-dashed rounded-xl flex items-center justify-center p-12 opacity-50 hover:opacity-100 transition-all hover:bg-zinc-900/50 group"
                    >
                        <div className="text-center space-y-2">
                            <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto group-hover:bg-zinc-800 transition-colors">
                                <span className="text-2xl text-zinc-500 group-hover:text-emerald-500 transition-colors">+</span>
                            </div>
                            <span className="text-xs font-mono uppercase tracking-widest text-zinc-600 group-hover:text-white transition-colors">Recruit Ally</span>
                        </div>
                    </button>
                </div>
            )}

            {/* Add Ally Modal */}
             {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Recruit Ally</h2>
                        <AllyForm onClose={() => setShowAdd(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
