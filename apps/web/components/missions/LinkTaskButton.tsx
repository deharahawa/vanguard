"use client";

import { useState } from "react";
import { Link2, Unlink, Check } from "lucide-react";
import { assignTaskToOperation, removeTaskFromOperation, OperationWithProgress } from "@/actions/operations";
import { BacklogItem } from "@vanguard/db";
import { toast } from "sonner";
import clsx from "clsx";

interface LinkTaskButtonProps {
    task: BacklogItem;
    operations: OperationWithProgress[];
}

export function LinkTaskButton({ task, operations }: LinkTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAssign = async (opId: string) => {
        setLoading(true);
        try {
            await assignTaskToOperation(task.id, opId);
            toast.success("Task Linked to Campaign");
            setIsOpen(false);
        } catch {
            toast.error("Failed to link task");
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async () => {
        setLoading(true);
        try {
            await removeTaskFromOperation(task.id);
            toast.success("Task Unlinked");
            setIsOpen(false);
        } catch {
            toast.error("Failed to unlink task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "p-2 transition-colors opacity-0 group-hover:opacity-100",
                    task.operationId ? "text-emerald-500 hover:text-emerald-400" : "text-zinc-700 hover:text-zinc-300"
                )}
                disabled={loading}
            >
                <Link2 size={16} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 bg-black border border-zinc-800 rounded-lg shadow-xl z-20 py-1 max-h-64 overflow-y-auto">
                        <div className="px-3 py-2 text-[10px] uppercase font-bold text-zinc-500 border-b border-zinc-900 mb-1">
                            Assign to Campaign
                        </div>
                        
                        {task.operationId && (
                            <button
                                onClick={handleUnlink}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 text-red-500 flex items-center gap-2"
                            >
                                <Unlink size={12} /> Unlink Current
                            </button>
                        )}

                        {operations.map(op => (
                            <button
                                key={op.id}
                                onClick={() => handleAssign(op.id)}
                                className={clsx(
                                    "w-full text-left px-3 py-2 text-xs hover:bg-zinc-900 flex items-center gap-2 justify-between",
                                    task.operationId === op.id ? "text-emerald-500" : "text-zinc-300"
                                )}
                            >
                                <span className="truncate">{op.title}</span>
                                {task.operationId === op.id && <Check size={12} />}
                            </button>
                        ))}
                        
                        {operations.length === 0 && (
                            <div className="px-3 py-2 text-xs text-zinc-600 italic">No active campaigns</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
