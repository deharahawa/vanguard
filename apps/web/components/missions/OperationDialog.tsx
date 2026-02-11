"use client";

import { useState } from "react";
import { FolderOpen, Calendar, X } from "lucide-react";
import { createOperation, updateOperation } from "@/actions/operations";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface OperationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  operation?: {
    id: string;
    title: string;
    deadline: Date | null;
  };
}

export function OperationDialog({ isOpen, onClose, operation }: OperationDialogProps) {
  const [title, setTitle] = useState(operation?.title || "");
  const [deadline, setDeadline] = useState(operation?.deadline ? new Date(operation.deadline).toISOString().split("T")[0] : "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const deadlineDate = deadline ? new Date(deadline) : undefined;
      
      if (operation) {
        await updateOperation(operation.id, { title, deadline: deadlineDate });
        toast.success("Campaign Updated");
      } else {
        await createOperation(title, deadlineDate);
        toast.success("Campaign Created");
      }
      onClose();
    } catch {
      toast.error("Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
              <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2 text-emerald-500">
                <FolderOpen className="w-4 h-4" />
                {operation ? "Edit Campaign" : "New Campaign"}
              </h3>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Campaign Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Operation: Zero Dawn"
                  className="w-full bg-black/40 border border-zinc-800 rounded-lg px-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white placeholder:text-zinc-700 font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Target Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-white appearance-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={onClose}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-lg text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Deploy"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
