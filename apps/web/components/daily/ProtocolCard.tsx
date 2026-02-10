"use client";

import { Droplet, Wind, Footprints, Zap, Users } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { logDailyMetrics } from "@/actions/daily";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Metrics = {
    hydration: boolean;
    breathing: boolean;
    mobility: boolean;
    reset: boolean;
    diplomat: boolean;
    mood: number;
    summary: string | null;
}

export function ProtocolCard({ initialMetrics }: { initialMetrics: Metrics | null }) {
  const [mood, setMood] = useState(initialMetrics?.mood || 3);
  const [toggles, setToggles] = useState({
    hydration: initialMetrics?.hydration || false,
    breathing: initialMetrics?.breathing || false,
    mobility: initialMetrics?.mobility || false,
    reset: initialMetrics?.reset || false,
    diplomat: initialMetrics?.diplomat || false,
  });
  const [isPending, setIsPending] = useState(false);

  // Sync state if initialMetrics changes (revalidation)
  // This is optional if we assume full page reload, but good for revalidatePath updates
  // useEffect(() => {
  //   if (initialMetrics) {
  //       setMood(initialMetrics.mood);
  //       setToggles({
  //           hydration: initialMetrics.hydration,
  //           breathing: initialMetrics.breathing,
  //           mobility: initialMetrics.mobility,
  //           reset: initialMetrics.reset,
  //           diplomat: initialMetrics.diplomat
  //       });
  //   }
  // }, [initialMetrics]);


  const router = useRouter();

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    try {
        const result = await logDailyMetrics(formData);
        
        if (result?.levelUp) {
            toast("LEVEL UP", {
                description: result.levelUp,
                duration: 5000,
                style: {
                    background: 'linear-gradient(to right, #10b981, #3b82f6)',
                    color: 'white',
                    border: '1px solid #ffffff50'
                }
            });
        } else if (result?.xpGained) {
            toast.success("PROTOCOL LOGGED", {
                description: "+10 XP GAINED",
                duration: 3000,
            });
        } else {
             toast.success("PROTOCOL LOGGED", {
                description: "Data synced to command center.",
                duration: 3000,
            });
        }

        // Reset Form State
        setMood(3);
        setToggles({
            hydration: false,
            breathing: false,
            mobility: false,
            reset: false,
            diplomat: false,
        });
        // Reset Textarea (Uncontrolled)
        const form = document.querySelector("form");
        if (form) form.reset();

        setTimeout(() => {
            router.push("/chronicle");
        }, 2000);
    } catch {
        toast.error("TRANSMISSION FAILED");
        setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="w-full max-w-md p-6 bg-zinc-950 border border-zinc-900 rounded-xl space-y-8 shadow-2xl relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500 opacity-50" />

      <div className="space-y-2 text-center">
        <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase">The Trinity</h2>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">Daily Alignment Protocol</p>
      </div>

      <div className="space-y-6">
        {/* OPERATOR SECTION */}
        <section className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-900"></div>
                <h3 className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">Operator // Execution</h3>
                <div className="h-px flex-1 bg-zinc-900"></div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <ToggleItem
                  active={toggles.hydration}
                  onClick={() => handleToggle("hydration")}
                  icon={<Droplet className="w-5 h-5" />}
                  label="Hydrate"
                  color="text-amber-100"
                  bg="bg-amber-900/20"
                  border="border-amber-900/50"
                  glow="shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  name="hydration"
                />
                <ToggleItem
                  active={toggles.mobility}
                  onClick={() => handleToggle("mobility")}
                  icon={<Footprints className="w-5 h-5" />}
                  label="Mobility"
                  color="text-amber-100"
                  bg="bg-amber-900/20"
                  border="border-amber-900/50"
                  glow="shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  name="mobility"
                />
             </div>
        </section>

        {/* STOIC SECTION */}
        <section className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-900"></div>
                <h3 className="text-[10px] font-bold text-indigo-500/80 uppercase tracking-widest">Stoic // Control</h3>
                <div className="h-px flex-1 bg-zinc-900"></div>
             </div>
             <div className="grid grid-cols-2 gap-3">
                <ToggleItem
                  active={toggles.breathing}
                  onClick={() => handleToggle("breathing")}
                  icon={<Wind className="w-5 h-5" />}
                  label="Breath"
                  color="text-indigo-100"
                  bg="bg-indigo-900/20"
                  border="border-indigo-900/50"
                  glow="shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  name="breathing"
                />
                <ToggleItem
                  active={toggles.reset}
                  onClick={() => handleToggle("reset")}
                  icon={<Zap className="w-5 h-5" />}
                  label="Reset"
                  color="text-indigo-100"
                  bg="bg-indigo-900/20"
                  border="border-indigo-900/50"
                  glow="shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  name="reset"
                />
             </div>
        </section>

        {/* DIPLOMAT SECTION */}
        <section className="space-y-3">
             <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-zinc-900"></div>
                <h3 className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Diplomat // Tribe</h3>
                <div className="h-px flex-1 bg-zinc-900"></div>
             </div>
             <div className="grid grid-cols-1 gap-3">
                <ToggleItem
                  active={toggles.diplomat}
                  onClick={() => handleToggle("diplomat")}
                  icon={<Users className="w-5 h-5" />}
                  label="Alignment"
                  color="text-emerald-100"
                  bg="bg-emerald-900/20"
                  border="border-emerald-900/50"
                  glow="shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                  name="diplomat"
                  fullWidth
                />
             </div>
        </section>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block text-center">Mood Calibration</label>
        <div className="flex justify-between px-4 bg-zinc-900/30 py-3 rounded-lg border border-zinc-900">
          {["💀", "🌧️", "☁️", "🌤️", "⚡"].map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setMood(index + 1)}
              className={clsx(
                "text-2xl transition-all duration-300 transform hover:scale-125",
                mood === index + 1 ? "scale-125 grayscale-0 drop-shadow-lg" : "grayscale opacity-30 hover:opacity-70"
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
        <input type="hidden" name="mood" value={mood} />
      </div>

      <div className="space-y-4">
        <textarea
          name="summary"
          placeholder="Mission Log..."
          defaultValue={initialMetrics?.summary || ""}
          className="w-full bg-zinc-950 border border-zinc-900 rounded-lg p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-zinc-700 h-24 resize-none transition-colors placeholder:text-zinc-800"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={clsx(
            "w-full py-4 text-xs font-black uppercase tracking-[0.2em] bg-white text-black hover:bg-zinc-200 transition-all rounded-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]",
            isPending && "opacity-50 cursor-wait"
        )}
      >
        {isPending ? "TRANSMITTING..." : "LOG PROTOCOL"}
      </button>
    </form>
  );
}

function ToggleItem({ active, onClick, icon, label, color, bg, border, glow, name, fullWidth }: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    color: string;
    bg: string;
    border: string;
    glow: string;
    name: string;
    fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        "group relative flex items-center justify-between p-4 rounded-lg border transition-all duration-300 overflow-hidden",
        fullWidth ? "w-full" : "w-full",
        active
          ? `${bg} ${border} ${glow}`
          : "bg-zinc-900/30 border-zinc-900 hover:border-zinc-800"
      )}
    >
        <div className="flex items-center gap-3 relative z-10">
            <span className={clsx("transition-colors duration-300", active ? color : "text-zinc-600 group-hover:text-zinc-500")}>
                {icon}
            </span>
            <span className={clsx("text-[10px] uppercase font-bold tracking-wider transition-colors duration-300", active ? "text-white" : "text-zinc-600 group-hover:text-zinc-500")}>
                {label}
            </span>
        </div>

        {/* Status Indicator Dot */}
        <div className={clsx("w-1.5 h-1.5 rounded-full transition-all duration-500", 
            active ? "bg-white shadow-[0_0_8px_white]" : "bg-zinc-800"
        )} />

        <input type="hidden" name={name} value={active ? "on" : "off"} />
    </button>
  );
}
