"use client";

import { updateIdentity } from "@/actions/profile";
import { ChevronRight } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-12">
        <div className="space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                Initialization Sequence
            </div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                Identify Yourself
            </h1>
            <p className="text-zinc-400">
                To enter the Vanguard Protocol, you must establish your tactical identity.
            </p>
        </div>

        <form action={async (formData) => {
            await updateIdentity(formData);
            window.location.href = "/dashboard";
        }} className="space-y-8 block">
            
            <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Codename</label>
                <input
                    name="codename"
                    required
                    placeholder="E.G. GHOST"
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 text-white font-black uppercase tracking-widest focus:outline-none focus:border-white transition-colors"
                />
                <p className="text-[10px] text-zinc-600">This will be your callsign in the logs.</p>
            </div>

             <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Manifesto</label>
                <textarea
                    name="bio"
                    required
                    rows={4}
                    placeholder="Define your mission parameters..."
                    className="w-full bg-zinc-900 border border-zinc-800 p-4 text-zinc-400 font-mono text-sm focus:outline-none focus:border-white transition-colors resize-none"
                />
            </div>

            <button 
                type="submit"
                className="w-full bg-indigo-600 text-white font-black uppercase tracking-widest py-4 hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 group"
            >
                Initialize Protocol
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>


        </form>
      </div>
    </div>
  );
}
