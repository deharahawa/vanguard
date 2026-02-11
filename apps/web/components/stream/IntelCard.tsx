import { IntelCardData } from "@/actions/stream";
import { Share2, Bookmark, ExternalLink, BrainCircuit, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toggleBookmark } from "@/actions/bookmark";
import { submitReflection } from "@/actions/dojo";
import { toast } from "sonner";
import { Drawer } from "vaul";
import { useHaptic } from "@/hooks/useHaptic";
import { clsx } from "clsx";

export function IntelCard({ data, initialSaved = false }: { data: IntelCardData; initialSaved?: boolean }) {
    const [saved, setSaved] = useState(initialSaved);
    const [reflecting, setReflecting] = useState(false);
    const [reflection, setReflection] = useState("");
    const [aiFeedback, setAiFeedback] = useState("");
    const [analyzing, setAnalyzing] = useState(false);
    const { triggerHaptic } = useHaptic();

    const handleBookmark = async () => {
        triggerHaptic("medium");
        const newSavedState = !saved;
        setSaved(newSavedState); // Optimistic

        toast(newSavedState ? "INTEL SAVED" : "INTEL REMOVED", {
            description: newSavedState ? "Added to database." : "Removed from database.",
            duration: 2000
        });

        const result = await toggleBookmark(data);
        if (result.error) {
            setSaved(!newSavedState); // Revert
            toast.error("SAVE FAILED");
        }
    };

    const handleShare = async () => {
        triggerHaptic("light");
        const shareData = {
            title: `Vanguard Intel: ${data.title}`,
            text: data.content,
            url: data.referenceUrl || window.location.href
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                console.log("Share failed or canceled");
            }
        } else {
            await navigator.clipboard.writeText(`${data.title}\n\n${data.content}\n\n${data.referenceUrl || ""}`);
            toast.success("COPIED TO CLIPBOARD");
        }
    };

    const handleReflect = async () => {
        if (!reflection.trim()) return;
        triggerHaptic("medium");
        setAnalyzing(true);
        try {
            const result = await submitReflection(data.content, reflection, data.category, data.id);
            if (result && result.feedback) {
                setAiFeedback(result.feedback);
                toast.success("Reflection Analyzed");
            } else {
                toast.error("Analysis Failed");
            }
        } catch {
             toast.error("System Failure");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col justify-center p-6 md:p-12 overflow-hidden bg-black snap-center">
            {/* Dynamic Background */}
            <div 
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${data.color} 0%, transparent 70%)`
                }}
            />
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-2xl mx-auto space-y-4 md:space-y-6 mb-12 md:mb-0">
                {/* Header */}
                <div className="flex items-center gap-3 animate-in slide-in-from-bottom-8 duration-700 delay-100">
                    <div className="w-1.5 h-12 rounded-full" style={{ backgroundColor: data.color }} />
                    <div className="space-y-1">
                        <span 
                            className="text-xs font-black uppercase tracking-[0.2em]"
                            style={{ color: data.color }}
                        >
                            {data.category}
                        </span>
                         <h1 className="text-2xl md:text-4xl font-black text-white leading-tight tracking-tight shadow-black drop-shadow-lg break-words">
                            {data.title}
                        </h1>
                    </div>
                </div>

                {/* Body */}
                <p className="text-zinc-300 text-base md:text-xl font-medium leading-relaxed max-w-prose drop-shadow-md animate-in slide-in-from-bottom-8 duration-700 delay-200 break-words">
                    {data.content}
                </p>

                {/* Actions & Read More */}
                <div className="flex flex-col md:flex-row gap-4 pt-4 animate-in slide-in-from-bottom-8 duration-700 delay-300 w-full">
                    
                    {/* Primary Actions (Stacked on mobile) */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Read More Trigger */}
                        {data.referenceUrl && (
                            <Drawer.Root>
                                <Drawer.Trigger asChild>
                                    <button className="px-6 py-4 md:py-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 rounded-xl md:rounded-full text-white text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group w-full md:w-auto">
                                        Read More
                                        <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Drawer.Trigger>
                                <Drawer.Portal>
                                    <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
                                    <Drawer.Content className="bg-zinc-950 flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] border-t border-zinc-800 outline-none">
                                        <div className="p-4 bg-zinc-950 rounded-t-[20px] flex-1">
                                            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-8" />
                                            <div className="max-w-2xl mx-auto space-y-8">
                                                <div className="space-y-4">
                                                     <span 
                                                        className="text-xs font-black uppercase tracking-[0.2em]"
                                                        style={{ color: data.color }}
                                                    >
                                                        {data.category} {'///'} Source
                                                    </span>
                                                    <h2 className="text-2xl font-bold text-white max-w-[80%]">{data.title}</h2>
                                                    <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                                                        <p className="text-zinc-400 font-mono text-xs break-all">
                                                            {data.referenceUrl}
                                                        </p>
                                                    </div>
                                                </div>

                                                <a 
                                                    href={data.referenceUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-200"
                                                >
                                                    Open Source
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>
                                        </div>
                                    </Drawer.Content>
                                </Drawer.Portal>
                            </Drawer.Root>
                        )}
                        
                        {/* Reflect Drawer */}
                        <Drawer.Root open={reflecting} onOpenChange={setReflecting}>
                            <Drawer.Trigger asChild>
                                <button className="px-6 py-4 md:py-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/10 rounded-xl md:rounded-full text-white text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 group w-full md:w-auto">
                                    Reflect
                                    <BrainCircuit size={14} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </Drawer.Trigger>
                            <Drawer.Portal>
                                <Drawer.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]" />
                                <Drawer.Content className="bg-zinc-950 flex flex-col rounded-t-[20px] h-[85vh] fixed bottom-0 left-0 right-0 z-[101] border-t border-zinc-800 outline-none">
                                    <div className="p-6 bg-zinc-950 rounded-t-[20px] flex-1 overflow-y-auto">
                                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-800 mb-8" />
                                        <div className="max-w-lg mx-auto space-y-8">
                                            <div className="space-y-4">
                                                <span className="text-xs font-mono font-bold text-emerald-500 uppercase tracking-widest">Active Reflection</span>
                                                <h3 className="text-2xl font-bold text-white leading-tight">
                                                    &quot;{data.content}&quot;
                                                </h3>
                                            </div>

                                            {!aiFeedback ? (
                                                <div className="space-y-4">
                                                    <textarea 
                                                        autoFocus
                                                        value={reflection}
                                                        onChange={(e) => setReflection(e.target.value)}
                                                        placeholder="How does this apply to your mission?"
                                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 min-h-[150px] resize-none font-mono text-sm leading-relaxed"
                                                    />
                                                    <button 
                                                        onClick={handleReflect}
                                                        disabled={analyzing || !reflection.trim()}
                                                        className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                                    >
                                                        {analyzing ? (
                                                            <>Analyzing <Loader2 size={16} className="animate-spin" /></>
                                                        ) : (
                                                            <>Transmit Reflection <BrainCircuit size={16} /></>
                                                        )}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="p-6 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-3">
                                                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                                            <BrainCircuit size={16} />
                                                            <span className="text-xs font-bold uppercase tracking-widest">Sensei Feedback</span>
                                                        </div>
                                                        <p className="text-emerald-100/90 leading-relaxed font-mono text-sm">
                                                            {aiFeedback}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setReflecting(false)}
                                                        className="w-full py-4 bg-zinc-900 text-white border border-zinc-800 font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        Close Session <Check size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Drawer.Content>
                            </Drawer.Portal>
                        </Drawer.Root>
                    </div>

                    {/* Secondary Actions (Icons) */}
                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto md:ml-auto">
                         <div className="text-[10px] md:hidden text-zinc-600 font-mono">
                            DATA ID: {data.id.slice(0, 4)}
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={handleBookmark}
                                className={clsx(
                                    "p-3 rounded-full border transition-all duration-300 group",
                                    saved 
                                        ? "bg-white text-black border-white shadow-[0_0_20px_white]" 
                                        : "bg-black/40 text-white border-white/20 hover:bg-white/10"
                                )}
                            >
                                <Bookmark size={20} className={clsx("transition-transform group-active:scale-90", saved && "fill-current")} />
                            </button>

                            <button 
                                onClick={handleShare}
                                className="p-3 rounded-full bg-black/40 text-white border border-white/20 hover:bg-white/10 transition-all active:scale-90"
                            >
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
