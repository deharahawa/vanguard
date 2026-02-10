"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";
import { addToBacklog } from "@/actions/briefing";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddMissionForm() {
    const ref = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const content = String(formData.get("content"));
        if (!content.trim()) return;

        try {
            await addToBacklog(content);
            ref.current?.reset();
            toast.success("Task dumped into the Void");
            router.refresh();
        } catch {
            toast.error("Failed to add task");
        }
    };

    return (
        <form ref={ref} action={handleSubmit} className="flex gap-2">
            <input 
                name="content"
                type="text" 
                placeholder="Dump task here..." 
                className="flex-1 bg-zinc-900 border-none rounded-lg px-4 py-3 text-white placeholder-zinc-700 focus:ring-1 focus:ring-purple-900 outline-none font-mono text-sm"
                required
            />
            <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3 rounded-lg transition-colors">
                <Plus size={20} />
            </button>
        </form>
    );
}
