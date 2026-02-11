import { logInteraction, deleteAlly } from "@/actions/network";
import { AllyWithHealth } from "@/types/network";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, CheckCircle2, MoreVertical, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import clsx from "clsx";
import { AllyForm } from "./AllyForm";

export function AllyCard({ ally }: { ally: AllyWithHealth }) {
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    const handleConnect = async () => {
        setLoading(true);
        try {
            await logInteraction(ally.id);
            toast.success(`Connection logged with ${ally.name}`);
        } catch {
            toast.error("Failed to log connection");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to burn this contact? This action is irreversible.")) {
            try {
                await deleteAlly(ally.id);
                toast.success("Contact burned.");
            } catch {
                toast.error("Failed to delete contact.");
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CRITICAL': return 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]';
            case 'DECAYING': return 'bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
            default: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]';
        }
    };

    return (
        <>
            <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                onMouseLeave={() => setShowMenu(false)}
            >
                {/* Status Indicator Line */}
                <div className={clsx("absolute top-0 left-0 w-1 h-full transition-all duration-500", getStatusColor(ally.status))} />

                <div className="absolute top-2 right-2 z-10">
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 text-zinc-600 hover:text-white transition-colors"
                    >
                        <MoreVertical size={16} />
                    </button>
                    
                    <AnimatePresence>
                        {showMenu && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 mt-2 w-32 bg-zinc-950 border border-zinc-800 rounded-lg shadow-xl overflow-hidden z-20"
                            >
                                <button 
                                    onClick={() => { setShowEdit(true); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-3 text-xs uppercase font-bold text-zinc-400 hover:bg-zinc-900 hover:text-white flex items-center gap-2"
                                >
                                    <Edit size={12} /> Edit
                                </button>
                                <button 
                                    onClick={handleDelete}
                                    className="w-full text-left px-4 py-3 text-xs uppercase font-bold text-red-500 hover:bg-red-900/20 flex items-center gap-2"
                                >
                                    <Trash2 size={12} /> Burn
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 pl-8 space-y-6">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{ally.name}</h3>
                            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">{ally.role}</p>
                        </div>
                         <div className="text-right pr-6">
                            <div className={clsx("text-xl font-black tabular-nums", 
                                ally.health < 25 ? "text-red-500 animate-pulse" : 
                                ally.health < 75 ? "text-yellow-500" : "text-emerald-500"
                            )}>
                                {ally.health}%
                            </div>
                            <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Signal Strength</p>
                        </div>
                    </div>

                    {/* Health Bar */}
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${ally.health}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={clsx("h-full rounded-full", getStatusColor(ally.status).split(' ')[0])}
                        />
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                            <span className="text-zinc-600 uppercase tracking-wider block">Frequency</span>
                            <span className="text-zinc-300 font-mono">Every {ally.frequencyDays} Days</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        {ally.contactMethod && (
                            <a 
                                href={ally.contactMethod}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
                            >
                                Initiate <ExternalLink size={14} />
                            </a>
                        )}
                        
                        <button
                            onClick={handleConnect}
                            disabled={loading}
                            className={clsx(
                                "flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed",
                                ally.health < 25 
                                    ? "bg-red-600 hover:bg-red-500 text-white animate-pulse" 
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white",
                                !ally.contactMethod && "col-span-2"
                            )}
                        >
                            {loading ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            {loading ? "Syncing..." : "Mark Connected"}
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showEdit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
                        >
                            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Edit Dossier</h2>
                            <AllyForm initialData={ally} onClose={() => setShowEdit(false)} />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
