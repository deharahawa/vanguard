"use client";

import { OperationWithProgress, completeOperation } from "@/actions/operations";
import { motion } from "framer-motion";
import { FolderOpen, Calendar, CheckSquare, Square, Flag } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import clsx from "clsx";
import { formatDistanceToNow } from "date-fns";

export function OperationCard({ operation }: { operation: OperationWithProgress }) {
    const [completing, setCompleting] = useState(false);

    const handleComplete = async () => {
        if (operation.progress < 100) {
            toast.error("Operation incomplete. Finish all tasks.");
            return;
        }

        setCompleting(true);
        try {
            await completeOperation(operation.id);
            toast.success("Operation Complete. XP Awarded.");
        } catch {
            toast.error("Failed to close operation");
        } finally {
            setCompleting(false);
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-xl overflow-hidden relative group"
        >
            {/* Folder Tab Effect */}
            <div className="absolute top-0 left-0 w-24 h-1 bg-emerald-500/50" />

            <div className="p-6 space-y-6">
                
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                            <FolderOpen size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Campaign</span>
                        </div>
                        <h3 className="text-xl font-bold text-white">{operation.title}</h3>
                    </div>
                    {operation.deadline && (
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-900">
                            <Calendar size={12} />
                            <span>{formatDistanceToNow(new Date(operation.deadline), { addSuffix: true })}</span>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                        <span>Progress</span>
                        <span className={clsx(operation.progress === 100 ? "text-emerald-500 animate-pulse" : "")}>{operation.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${operation.progress}%` }}
                            className={clsx(
                                "h-full rounded-full transition-all duration-1000",
                                operation.progress === 100 ? "bg-emerald-500" : "bg-emerald-500/50"
                            )}
                        />
                    </div>
                </div>

                {/* Tasks Preview */}
                <div className="space-y-2 pl-2 border-l border-zinc-800">
                    {operation.tasks.map(task => (
                        <div key={task.id} className="flex items-center gap-3 text-sm group/task">
                            {task.status === 'COMPLETED' ? (
                                <CheckSquare size={14} className="text-emerald-500/50" />
                            ) : (
                                <Square size={14} className="text-zinc-700 group-hover/task:text-zinc-500 transition-colors" />
                            )}
                            <span className={clsx(
                                "transition-colors",
                                task.status === 'COMPLETED' ? "text-zinc-600 line-through" : "text-zinc-400"
                            )}>
                                {task.content}
                            </span>
                        </div>
                    ))}
                    {operation.tasks.length === 0 && (
                        <p className="text-zinc-600 italic text-xs">No tasks assigned yet.</p>
                    )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-zinc-800/50">
                    <button
                        onClick={handleComplete}
                        disabled={operation.progress < 100 || completing}
                        className={clsx(
                            "w-full py-3 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                            operation.progress === 100 
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02]" 
                                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        )}
                    >
                        {completing ? "Archiving..." : "Complete Mission"}
                        {operation.progress === 100 && <Flag size={14} />}
                    </button>
                    {operation.progress < 100 && (
                        <p className="text-[10px] text-center text-zinc-600 mt-2 uppercase tracking-wide">
                            All objectives must be met
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
