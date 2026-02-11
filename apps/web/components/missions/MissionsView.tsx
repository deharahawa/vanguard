"use client";

import { useState } from "react";
import { AddMissionForm } from "@/components/missions/AddMissionForm";
import { Ghost, Target, Trash2, FolderOpen, Globe, LayoutGrid } from "lucide-react";
import { deleteBacklogItem, completeBacklogItem, type WisdomContent } from "@/actions/briefing";
import { BacklogItem } from "@vanguard/db";
import { OperationWithProgress } from "@/actions/operations";
import { OperationCard } from "@/components/operations/OperationCard";
import { CompleteMissionButton } from "@/components/missions/CompleteMissionButton";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { toast } from "sonner";

interface MissionsViewProps {
    briefing: {
        mission: BacklogItem | null;
        wisdoms: WisdomContent;
    };
    backlog: BacklogItem[];
    operations: OperationWithProgress[];
}

export function MissionsView({ briefing, backlog, operations }: MissionsViewProps) {
    const [tab, setTab] = useState<'VOID' | 'CAMPAIGN'>('VOID');

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-32">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-white">Missions</h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Tactical Objectives</p>
            </header>

            <div className="max-w-2xl mx-auto flex flex-col gap-8">
                {/* Active Mission (Always Visible) */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-red-500">
                        <Target className="w-5 h-5" />
                        <h2 className="font-bold uppercase tracking-widest text-sm">Active Directive</h2>
                    </div>
                    
                    {briefing.mission ? (
                        <div className="bg-gradient-to-br from-red-950/30 to-black border border-red-900/50 p-6 rounded-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                           
                           <h3 className="text-2xl font-bold text-white mb-4">{briefing.mission.content}</h3>
                           
                           <form action={async () => {
                               if (briefing.mission) {
                                   await completeBacklogItem(briefing.mission.id);
                                   toast.success("Directive Completed");
                               }
                           }}>
                               <CompleteMissionButton />
                           </form>
                        </div>
                    ) : (
                         <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-6 rounded-2xl text-center">
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No Active Directives.</p>
                        </div>
                    )}
                </section>

                {/* Tabs */}
                <div className="flex p-1 bg-zinc-900/50 rounded-lg backdrop-blur-sm border border-zinc-800">
                    <button 
                        onClick={() => setTab('VOID')}
                        className={clsx(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
                            tab === 'VOID' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <Ghost size={14} /> The Void
                    </button>
                    <button 
                        onClick={() => setTab('CAMPAIGN')}
                        className={clsx(
                            "flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all flex items-center justify-center gap-2",
                            tab === 'CAMPAIGN' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                        )}
                    >
                        <FolderOpen size={14} /> Campaign
                    </button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    {tab === 'VOID' ? (
                        <motion.div 
                            key="void"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6"
                        >
                             <div className="flex items-center gap-2 mb-6 text-purple-500">
                                <LayoutGrid className="w-4 h-4" />
                                <h3 className="font-bold uppercase tracking-widest text-xs">Backlog Management</h3>
                            </div>

                            <AddMissionForm />

                            <div className="flex flex-col gap-2 mt-8">
                                {backlog.length === 0 && (
                                    <p className="text-center text-zinc-600 text-xs uppercase tracking-widest py-8">The Void is silent.</p>
                                )}
                                {backlog.map((item) => (
                                    <div key={item.id} className="group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors">
                                        <div className="space-y-1">
                                            <span className="text-zinc-300 font-mono text-sm block">{item.content}</span>
                                            {item.operationId && (
                                                <div className="flex items-center gap-1 text-[10px] text-emerald-500 uppercase tracking-wider">
                                                    <FolderOpen size={10} />
                                                    <span>Linked to Op</span>
                                                </div>
                                            )}
                                        </div>
                                        <form action={async () => {
                                            await deleteBacklogItem(item.id);
                                            toast("Item Deleted");
                                        }}>
                                            <button className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                                                <Trash2 size={16} />
                                            </button>
                                        </form>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="campaign"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-emerald-500">
                                    <Globe className="w-4 h-4" />
                                    <h3 className="font-bold uppercase tracking-widest text-xs">Operations Overview</h3>
                                </div>
                                {/* Future: Create Operation Button */}
                            </div>

                            {operations.length === 0 ? (
                                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
                                    <p className="text-zinc-500 text-xs uppercase tracking-widest">No Active Operations</p>
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    {operations.map(op => (
                                        <OperationCard key={op.id} operation={op} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
