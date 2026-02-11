"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchIntelBatch, IntelCardData } from "@/actions/stream";
import { getSavedIntelIds } from "@/actions/bookmark";
import { IntelCard } from "@/components/stream/IntelCard";
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

export function StreamFeed() {
    const [cards, setCards] = useState<IntelCardData[]>([]);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [batchIndex, setBatchIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "200px", // Trigger before reaching the bottom
    });

    const loadBatch = useCallback(async (index: number) => {
        setLoading(true);
        const result = await fetchIntelBatch(index);
        
        if (result.stop) {
            setFinished(true);
            setLoading(false);
            return;
        }

        if (result.message && !result.cards.length) {
            setError(result.message);
            setLoading(false);
            return;
        }

        setCards(prev => [...prev, ...result.cards]);
        setBatchIndex(index);
        setLoading(false);
    }, []);

    // Initial Load & Bookmarks
    useEffect(() => {
        loadBatch(0);
        getSavedIntelIds().then(setSavedIds).catch(console.error);
    }, [loadBatch]);

    // Infinite Scroll Logic
    useEffect(() => {
        if (inView && !loading && !finished && !error) {
            loadBatch(batchIndex + 1);
        }
    }, [inView, loading, finished, error, batchIndex, loadBatch]);

    return (
        <div className="w-full h-[calc(100vh-64px)] md:h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar">
            {cards.map((card, index) => (
                <div key={index} className="w-full h-full snap-start snap-always">
                    <IntelCard 
                        data={card} 
                        initialSaved={savedIds.includes(card.id)} 
                    />
                </div>
            ))}

            {/* Loading Indicator / Intersection Target */}
            {!finished && !error && (
                <div ref={ref} className="w-full h-24 snap-start flex items-center justify-center">
                    {loading && (
                        <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs uppercase tracking-widest animate-pulse">
                            <Loader2 size={16} className="animate-spin" />
                            Decrypting Stream...
                        </div>
                    )}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="w-full h-full snap-start flex items-center justify-center p-8">
                    <div className="text-center space-y-4">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                        <p className="text-red-400 font-mono text-xs uppercase tracking-widest">{error}</p>
                        <button 
                                onClick={() => loadBatch(batchIndex)}
                                className="px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-xs font-bold uppercase rounded transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                </div>
            )}

            {/* Mission Complete Wall */}
            {finished && (
                <div className="w-full h-full snap-start flex flex-col items-center justify-center p-8 text-center space-y-6 bg-zinc-950">
                    <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 animate-in zoom-in duration-500">
                        <ShieldCheck size={48} className="text-emerald-500" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Mission Complete</h2>
                        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mt-2">Daily Intel Limit Reached</p>
                    </div>
                    <Link 
                        href="/dashboard"
                        className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-lg hover:bg-zinc-200 transition-all hover:scale-105"
                    >
                        Return to Command
                    </Link>
                </div>
            )}
        </div>
    );
}
