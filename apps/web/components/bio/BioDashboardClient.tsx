"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { logMeal, logWorkout, logBio, consultBioAI, evaluateNutrition, saveWorkoutTemplate, getWorkoutTemplates, logOutput, getDailyOutputs, getOutputStats } from "@/actions/bio"; // Added Output actions
import { Loader2, Dumbbell, Activity, Moon, Flame, BrainCircuit, TrendingUp } from "lucide-react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseSet {
  id: string;
  name: string;
  weight: number;
  reps: number;
}

interface WorkoutSession {
  id: string;
  userId: string;
  date: Date;
  type: string;
  name?: string | null;
  isTemplate: boolean;
  notes?: string | null;
  imageUrl?: string | null;
  sets: ExerciseSet[];
}

interface OutputLog {
  id: string;
  userId: string;
  date: Date;
  stoolType: number;
  stoolColor: string;
  stoolNotes: string | null;
}

type Tab = "FUEL" | "IRON" | "OUTPUT" | "RECOVERY";

interface BioStats {
    date: string;
    sleep: number;
    calories: number;
    protein: number;
    volume: number;
}

export default function BioDashboardClient({ stats }: { stats: BioStats[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("FUEL");
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAiAdvice(null);
    try {
        // Prepare context based on tab
        const contextMap: Record<Tab, "MEAL" | "WORKOUT" | "SLEEP"> = {
            "FUEL": "MEAL",
            "IRON": "WORKOUT",
            "OUTPUT": "MEAL", // Output relates to digestion/meal
            "RECOVERY": "SLEEP"
        };

        // Filter relevant stats for context
        // For simplicity, we send the last 7 days of stats plus specific tab info if we had it.
        // Ideally we'd send the form state too, but let's send standard 'stats' for overall trend analysis + context.
        const recentStats = stats.slice(-7);
        
        const result = await consultBioAI(contextMap[activeTab], recentStats);
        if (result.success && result.advice) {
            setAiAdvice(result.advice);
        } else {
            toast.error("Bio-Engine Offline");
        }
    } catch {
        toast.error("Analysis Failed");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-100 p-4 md:p-8 space-y-8 font-mono">
      <header className="space-y-2 flex flex-col md:flex-row justify-between md:items-end">
        <div>
            <h1 className="text-3xl font-bold tracking-tighter text-rose-500">BIO-TELEMETRY</h1>
            <p className="text-sm text-gray-500">OPTIMIZE THE MACHINE. // 4TH PILLAR</p>
        </div>
        <button 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-2 bg-rose-900/20 text-rose-400 border border-rose-900/50 px-4 py-2 rounded hover:bg-rose-900/40 transition-all disabled:opacity-50"
        >
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            {isAnalyzing ? "CONNECTING TO BIO-ENGINE..." : "ANALYZE INTEL"}
        </button>
      </header>

      {/* AI TACTICAL CARD */}
      <AnimatePresence>
        {aiAdvice && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                <h3 className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" /> TACTICAL PRECRIPTION
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-rose-100/90 whitespace-pre-wrap font-sans">
                    {aiAdvice}
                </div>
                <button 
                    onClick={() => setAiAdvice(null)}
                    className="absolute top-4 right-4 text-rose-500/50 hover:text-rose-500"
                >
                    ✕
                </button>
            </motion.div>
        )}
      </AnimatePresence>
      
      {/* Navigation */}
      <nav className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg overflow-x-auto">
        {(["FUEL", "IRON", "OUTPUT", "RECOVERY"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition-all ${
              activeTab === tab 
                ? "bg-rose-900/40 text-rose-400 shadow-sm ring-1 ring-rose-500/20" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="space-y-6">
        {activeTab === "FUEL" && <FuelModule />}
        {activeTab === "IRON" && <IronModule stats={stats} />}
        {activeTab === "OUTPUT" && <OutputModule />}
        {activeTab === "RECOVERY" && <RecoveryModule stats={stats} />}
      </main>
    </div>
  );
}

// --- MODULES ---

interface FuelState {
  BREAKFAST: string[];
  LUNCH: string[];
  SNACK: string[];
  DINNER: string[];
}

function FuelModule() {
  const [meals, setMeals] = useState<FuelState>({
    BREAKFAST: [],
    LUNCH: [],
    SNACK: [],
    DINNER: []
  });
  
  const [newItem, setNewItem] = useState("");
  const [activeMeal, setActiveMeal] = useState<keyof FuelState>("LUNCH");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [nutritionFeedback, setNutritionFeedback] = useState<string | null>(null);



  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    
    const updatedList = [...meals[activeMeal], newItem];
    setMeals(prev => ({ ...prev, [activeMeal]: updatedList }));
    setNewItem("");

    // Auto-save to DB
    await logMeal({
        date: new Date(),
        type: activeMeal,
        items: updatedList
    });
    
    toast.success("Added to " + activeMeal);
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setNutritionFeedback(null);
    try {
        // We ensure we save the current state before evaluating
        await logMeal({ date: new Date(), type: activeMeal, items: meals[activeMeal] });
        
        const result = await evaluateNutrition(new Date());
        if (result.success && result.feedback) {
            setNutritionFeedback(result.feedback);
        } else {
            toast.error("AI Analysis Unavailable");
        }
    } catch {
       toast.error("Evaluation Failed");
    } finally {
        setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
       {/* NUTRITION FEEDBACK CARD */}
       <AnimatePresence>
        {nutritionFeedback && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" /> NUTRITION VERDICT
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-emerald-100/90 whitespace-pre-wrap font-sans">
                    {nutritionFeedback}
                </div>
                <button 
                    onClick={() => setNutritionFeedback(null)}
                    className="absolute top-4 right-4 text-emerald-500/50 hover:text-emerald-500"
                >
                    ✕
                </button>
            </motion.div>
        )}
       </AnimatePresence>

       <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center"><Flame className="w-5 h-5 mr-2 text-rose-500"/> FUEL LOG</h3>
            <button 
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="text-xs bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-600/50 px-3 py-1 rounded transition-colors flex items-center gap-2"
            >
                {isEvaluating ? <Loader2 className="w-3 h-3 animate-spin"/> : <Activity className="w-3 h-3"/>}
                EVALUATE DAY
            </button>
          </div>

          {/* MEAL TABS */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const).map(type => (
                <button
                    key={type}
                    onClick={() => setActiveMeal(type)}
                    className={`px-4 py-2 rounded text-xs font-bold transition-all whitespace-nowrap ${activeMeal === type ? "bg-white text-black" : "bg-black/40 text-gray-500 hover:text-white"}`}
                >
                    {type}
                </button>
            ))}
          </div>

          {/* INPUT AREA */}
          <div className="space-y-4">
            <div className="flex gap-2">
                <input 
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
                    placeholder={`Add item to ${activeMeal}...`}
                    className="flex-1 bg-black/40 border border-white/10 rounded px-4 py-3 text-sm focus:border-rose-500 outline-none transition-colors"
                />
                <button 
                    onClick={handleAddItem}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded transition-colors"
                >
                    +
                </button>
            </div>

            {/* LIST */}
            <div className="bg-black/20 rounded-lg p-2 min-h-[100px] border border-white/5">
                {meals[activeMeal].length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-700 text-xs py-8">
                        <span>NO FUEL LOGGED</span>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {meals[activeMeal].map((item, idx) => (
                            <li key={idx} className="flex items-center justify-between bg-zinc-900/50 px-3 py-2 rounded border border-white/5 group">
                                <span className="text-sm text-zinc-300">{item}</span>
                                <button 
                                    onClick={() => {
                                        const newList = meals[activeMeal].filter((_, i) => i !== idx);
                                        setMeals(prev => ({ ...prev, [activeMeal]: newList }));
                                        logMeal({ date: new Date(), type: activeMeal, items: newList });
                                    }}
                                    className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
       </div>
    </div>
  )
}

interface SetData {
  weight: number;
  reps: number;
}

interface ExerciseData {
  id: string;
  name: string;
  sets: SetData[];
}

function IronModule({ stats }: { stats: BioStats[] }) {
  const [mode, setMode] = useState<"MUSCLE" | "RUNNING">("MUSCLE");
  
  // Charts Data
  const chartData = stats.slice(-14).map(s => ({
      date: s.date.split("-").slice(1).join("/"),
      volume: s.volume
  }));

  return (
    <div className="space-y-6">
        {/* CHART */}
       <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl">
            <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4"/> VOLUME LOAD TRAJECTORY
            </h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                            itemStyle={{ fontSize: "12px" }}
                        />
                        <Line type="monotone" dataKey="volume" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#f43f5e" }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
       </div>

       {/* MODE TOGGLE */}
       <div className="flex gap-4 border-b border-white/10 pb-4">
         <button 
           onClick={() => setMode("MUSCLE")}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${mode === "MUSCLE" ? "bg-rose-600 text-black" : "text-gray-500 hover:text-white"}`}
         >
           <Dumbbell className="w-4 h-4" /> MUSCLE
         </button>
         <button 
           onClick={() => setMode("RUNNING")}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${mode === "RUNNING" ? "bg-rose-600 text-black" : "text-gray-500 hover:text-white"}`}
         >
           <Activity className="w-4 h-4" /> RUNNING
         </button>
       </div>

       {mode === "MUSCLE" ? <MuscleLogger /> : <RunLogger />}
    </div>
  )
}

function MuscleLogger() {
    const [exercises, setExercises] = useState<ExerciseData[]>([
        { id: "1", name: "", sets: [{ weight: 0, reps: 0 }] }
    ]);
    const [activeProgram, setActiveProgram] = useState<string | null>(null);
    const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);



    const loadTemplate = async (programName: string) => {
        setIsLoadingTemplate(true);
        setActiveProgram(programName);
        try {
            const templates: (WorkoutSession & { sets: ExerciseSet[] })[] = await getWorkoutTemplates();
            const target = templates.find(t => t.name === programName);
            
            if (target && target.sets.length > 0) {
                // Reconstruct exercises from flat sets
                // Assuming sets are stored in order. We need to group them by name to reconstruct "Exercise" objects.
                // This is a bit tricky since we flattened them. 
                // Strategy: Group consecutive sets with same name? Or just list them?
                // The current UI expects "Exercise -> Sets". 
                // Let's group by name.
                
                const reconstructed: ExerciseData[] = [];
                let currentEx: ExerciseData | null = null;
                
                target.sets.forEach((s: { name: string; weight: number; reps: number }) => {
                    if (!currentEx || currentEx.name !== s.name) {
                        if (currentEx) reconstructed.push(currentEx);
                        currentEx = {
                            id: Math.random().toString(),
                            name: s.name,
                            sets: [{ weight: s.weight, reps: s.reps }]
                        };
                    } else {
                        currentEx.sets.push({ weight: s.weight, reps: s.reps });
                    }
                });
                if (currentEx) reconstructed.push(currentEx);
                
                setExercises(reconstructed);
                toast.success(`Loaded ${programName}`);
            } else {
                toast.info(`No data for ${programName} (Start Fresh)`);
                setExercises([{ id: Math.random().toString(), name: "", sets: [{ weight: 0, reps: 0 }] }]);
            }
        } catch {
            toast.error("Failed to load template");
        } finally {
            setIsLoadingTemplate(false);
        }
    };

    const handleSaveTemplate = async () => {
        if (!activeProgram) return;
        
        const validExercises = exercises.filter(e => e.name.trim() !== "");
        if (validExercises.length === 0) return;

        const flatSets = validExercises.flatMap(e => 
            e.sets.map(s => ({ name: e.name, weight: s.weight, reps: s.reps }))
        );

        const result = await saveWorkoutTemplate({
            name: activeProgram,
            type: "LIFT",
            sets: flatSets
        });

        if (result.success) {
            toast.success(`${activeProgram} Saved`);
        } else {
            toast.error("Save Failed");
        }
    };

    // ... existing helpers ...
    const addExercise = () => {
        setExercises(prev => [...prev, { id: Math.random().toString(), name: "", sets: [{ weight: 0, reps: 0 }] }]);
    };

    const updateExerciseName = (id: string, name: string) => {
        setExercises(prev => prev.map(e => e.id === id ? { ...e, name } : e));
    };

    const addSet = (exerciseId: string) => {
        setExercises(prev => prev.map(e => {
            if (e.id !== exerciseId) return e;
            const lastSet = e.sets[e.sets.length - 1];
            return { ...e, sets: [...e.sets, { weight: lastSet.weight, reps: lastSet.reps }] };
        }));
    };

    const updateSet = (exerciseId: string, setIndex: number, field: keyof SetData, value: number) => {
        setExercises(prev => prev.map(e => {
            if (e.id !== exerciseId) return e;
            const newSets = [...e.sets];
            newSets[setIndex] = { ...newSets[setIndex], [field]: value };
            return { ...e, sets: newSets };
        }));
    };
    
    const removeSet = (exerciseId: string, setIndex: number) => {
        setExercises(prev => prev.map(e => {
            if (e.id !== exerciseId) return e;
            return { ...e, sets: e.sets.filter((_, i) => i !== setIndex) };
        }));
    };

    const handleSubmit = async () => {
        // Validation
        const validExercises = exercises.filter(e => e.name.trim() !== "");
        if (validExercises.length === 0) {
            toast.error("Add at least one exercise");
            return;
        }

        const flatSets = validExercises.flatMap(e => 
            e.sets.map(s => ({ name: e.name, weight: s.weight, reps: s.reps }))
        );

        await logWorkout({
            date: new Date(),
            type: "LIFT",
            notes: activeProgram ? `Session: ${activeProgram}` : "Muscle Session",
            sets: flatSets
        });
        
        toast.success("Muscle Session Logged");
        // Don't clear immediately if using a template? Actually yes, clear to show it's done. 
        // Or keep it? Standard app behavior is reset.
        setExercises([{ id: Math.random().toString(), name: "", sets: [{ weight: 0, reps: 0 }] }]);
    };

    return (
        <div className="space-y-6">
            <div className="bg-rose-500/20 text-rose-500 text-[10px] p-1 text-center font-mono">
                TEMPLATE SYSTEM ACTIVE
            </div>
            {/* PROGRAM SELECTOR */}
            <div className="grid grid-cols-3 gap-2">
                {["Program A", "Program B", "Program C"].map(prog => (
                    <button
                        key={prog}
                        onClick={() => loadTemplate(prog)}
                        disabled={isLoadingTemplate}
                        className={`py-2 text-xs font-bold rounded border transition-all ${activeProgram === prog ? "bg-white text-black border-white" : "bg-transparent text-gray-500 border-gray-800 hover:border-gray-600"}`}
                    >
                        {isLoadingTemplate && activeProgram === prog ? <Loader2 className="w-3 h-3 animate-spin mx-auto"/> : prog.toUpperCase()}
                    </button>
                ))}
            </div>

            {exercises.map((exercise, exIdx) => (
                <div key={exercise.id} className="bg-black/20 border border-white/5 rounded-xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 mr-4">
                            <label className="text-xs text-gray-500 mb-1 block">EXERCISE {exIdx + 1}</label>
                            <input 
                                value={exercise.name}
                                onChange={(e) => updateExerciseName(exercise.id, e.target.value)}
                                placeholder="e.g. Bench Press"
                                className="w-full bg-black/40 border-b border-white/10 px-0 py-2 text-lg font-bold focus:border-rose-500 outline-none transition-colors"
                            />
                        </div>
                        <button 
                             onClick={() => {
                                 const newReview = exercises.filter(e => e.id !== exercise.id);
                                 setExercises(newReview);
                             }}
                             className="text-gray-600 hover:text-red-500 p-1"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-2">
                        {exercise.sets.map((set, setIdx) => (
                            <div key={setIdx} className="flex gap-4 items-center">
                                <div className="text-xs text-gray-600 w-8 font-mono">#{setIdx + 1}</div>
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={set.weight || ""} 
                                            onChange={(e) => updateSet(exercise.id, setIdx, "weight", Number(e.target.value))}
                                            placeholder="kg"
                                            className="w-full bg-black/40 rounded px-2 py-1 text-sm text-center"
                                        />
                                        <span className="absolute right-2 top-1.5 text-[10px] text-gray-600">KG</span>
                                    </div>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={set.reps || ""} 
                                            onChange={(e) => updateSet(exercise.id, setIdx, "reps", Number(e.target.value))}
                                            placeholder="reps"
                                            className="w-full bg-black/40 rounded px-2 py-1 text-sm text-center"
                                        />
                                        <span className="absolute right-2 top-1.5 text-[10px] text-gray-600">REPS</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => removeSet(exercise.id, setIdx)}
                                    className="text-gray-700 hover:text-red-500 px-2"
                                >
                                    -
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => addSet(exercise.id)}
                            className="w-full py-1 text-xs bg-white/5 hover:bg-white/10 text-gray-400 rounded transition-colors"
                        >
                            + ADD SET
                        </button>
                    </div>
                </div>
            ))}

            <div className="flex gap-4">
                <button 
                    onClick={addExercise}
                    className="flex-1 py-3 border border-dashed border-gray-700 hover:border-gray-500 text-gray-500 rounded-xl transition-colors"
                >
                    + NEW EXERCISE
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                {activeProgram && (
                    <button 
                        onClick={handleSaveTemplate}
                        className="py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                    >
                        SAVE TO {activeProgram.toUpperCase()}
                    </button>
                )}
                <button 
                    onClick={handleSubmit}
                    className={`py-3 bg-rose-600 hover:bg-rose-500 text-black font-bold rounded-xl transition-colors shadow-lg shadow-rose-900/20 ${!activeProgram ? "col-span-2" : ""}`}
                >
                    LOG SESSION
                </button>
            </div>
        </div>
    );
}

function RunLogger() {
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => {
        setIsSaving(true);
        await logWorkout({
            date: new Date(),
            type: "CARDIO",
            notes: notes,
            sets: [] // No sets for cardio typically, or could add specific metrics
        });
        toast.success("Cardio Session Logged");
        setNotes("");
        setIsSaving(false);
    };

    return (
         <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-semibold">TACTICAL RUN / CARDIO</h3>
            <div className="space-y-2">
                <label className="text-xs text-gray-500">SESSION INTEL (WARMUP, SPLITS, COOLDOWN)</label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm focus:border-rose-500 outline-none resize-none"
                    placeholder="e.g. 5min warmup, 5x 400m hard / 1min easy..."
                />
            </div>
            
            <div className="border-2 border-dashed border-gray-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-600">
                <Activity className="w-8 h-8 mb-2 opacity-50"/>
                <span className="text-xs">SMARTWATCH PRINT UPLOAD (SIMULATED)</span>
            </div>

            <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-rose-600 hover:bg-rose-500 text-black font-bold py-3 rounded-xl transition-colors"
            >
                {isSaving ? "LOGGING..." : "LOG RUN"}
            </button>
         </div>
    );
}

interface OutputFormValues {
  stoolType: number;
  stoolColor: string;
  stoolNotes: string;
}



function OutputModule() {
  const { register, handleSubmit, setValue, watch, reset } = useForm<OutputFormValues>();
  const stoolType = watch("stoolType");
  const stoolColor = watch("stoolColor");
  
  const [dailyLogs, setDailyLogs] = useState<OutputLog[]>([]);
  const [stats, setStats] = useState<{date: string, count: number}[]>([]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
        const today = await getDailyOutputs(new Date());
        setDailyLogs(today as unknown as OutputLog[]); // Date conversion might be needed
        
        // Mock stats for now or implement real aggregation
        // The server action returns raw logs for stats, let's process them
        const rawStats = await getOutputStats();
        // Aggregate by date
        const agg: Record<string, number> = {};
        rawStats.forEach((log: OutputLog) => {
            const d = new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
            agg[d] = (agg[d] || 0) + 1;
        });
        const chartData = Object.entries(agg).map(([date, count]) => ({ date, count }));
        setStats(chartData.slice(-7)); // Last 7 days
    };
    loadData();
  }, []);

  const onSubmit = async (data: OutputFormValues) => {
     await logOutput({
        date: new Date(),
        stoolType: Number(data.stoolType),
        stoolColor: data.stoolColor,
        stoolNotes: data.stoolNotes
     });
     toast.success("Bio-Metric Logged");
     
     // Refresh local list
     const today = await getDailyOutputs(new Date());
     setDailyLogs(today as unknown as OutputLog[]);
     reset();
  };

   const colors = ["#8B4513", "#228B22", "#000000", "#FF0000", "#DAA520"];
   const bristolScale = [
       { id: 1, desc: "Separate hard lumps", label: "Severe Constipation" },
       { id: 2, desc: "Lumpy sausage", label: "Mild Constipation" },
       { id: 3, desc: "Sausage with cracks", label: "Normal" },
       { id: 4, desc: "Smooth sausage", label: "Optimal" },
       { id: 5, desc: "Soft blobs", label: "Lacking Fiber" },
       { id: 6, desc: "Mushy, ragged edges", label: "Mild Diarrhea" },
       { id: 7, desc: "Liquid, no solids", label: "Severe Diarrhea" }
   ];

   const selectedBristol = bristolScale.find(b => b.id === stoolType);

  return (
    <div className="space-y-6">
      {/* FREQUENCY CHART */}
      <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl">
           <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4"/> FREQUENCY TRAJECTORY
            </h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                            itemStyle={{ fontSize: "12px" }}
                            cursor={{ fill: '#ffffff10' }}
                        />
                        <Bar dataKey="count" fill="#e11d48" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LOG FORM */}
          <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl h-fit">
            <h3 className="text-lg font-semibold flex items-center mb-6"><Activity className="w-5 h-5 mr-2 text-rose-500"/> NEW ENTRY</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
               
               {/* Bristol Scale */}
               <div className="space-y-3">
                 <div className="flex justify-between items-end">
                    <label className="text-xs text-gray-500 uppercase">Bristol Value (Type 1-7)</label>
                    {selectedBristol && (
                        <span className="text-xs text-rose-400 font-bold transition-all">
                            {selectedBristol.id} ({selectedBristol.desc})
                        </span>
                    )}
                 </div>
                 <div className="flex justify-between bg-black/40 p-2 rounded-lg gap-1">
                   {bristolScale.map(b => (
                     <button 
                      key={b.id}
                      type="button"
                      title={`${b.id}: ${b.desc} - ${b.label}`}
                      onClick={() => setValue("stoolType", b.id)}
                      className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-all border border-transparent ${stoolType === b.id ? "bg-rose-500 text-black scale-110 shadow-lg shadow-rose-900/50" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:border-gray-600"}`}
                     >
                       {b.id}
                     </button>
                   ))}
                 </div>
               </div>
    
               {/* Color */}
               <div className="space-y-3">
                 <label className="text-xs text-gray-500 uppercase">Pigmentation</label>
                 <div className="flex gap-6 justify-start p-2 rounded-lg bg-black/20">
                   {colors.map(c => (
                     <button
                       key={c}
                       type="button"
                       onClick={() => setValue("stoolColor", c)}
                       className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm ${stoolColor === c ? "border-white scale-110 ring-2 ring-rose-500 z-10" : "border-white/10 hover:border-white/50 opacity-80 hover:opacity-100"}`}
                       style={{ backgroundColor: c }}
                       title={c}
                     />
                   ))}
                 </div>
                 {['#000000', '#FF0000'].includes(stoolColor) && (
                   <p className="text-xs text-red-500 font-bold animate-pulse">WARNING: SEEK MEDICAL ATTENTION IF PERSISTENT.</p>
                 )}
               </div>
    
               <div className="space-y-2">
                  <label className="text-xs text-gray-500">NOTES</label>
                  <textarea {...register("stoolNotes")} className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:border-rose-500 outline-none h-20" placeholder="Observations..." />
               </div>
    
               <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-black font-bold py-2 rounded transition-colors">CONFIRM ENTRY</button>
            </form>
          </div>

          {/* DAILY TIMELINE */}
          <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl h-fit">
              <h3 className="text-lg font-semibold flex items-center mb-6"><TrendingUp className="w-5 h-5 mr-2 text-rose-500"/> TODAY&apos;S LOG</h3>
              <div className="space-y-4">
                  {dailyLogs.length === 0 ? (
                      <div className="text-center py-10 text-gray-600 text-sm">NO ACTIVITY RECORDED TODAY</div>
                  ) : (
                      dailyLogs.map((log) => (
                          <div key={log.id} className="flex gap-4 items-start relative pb-6 border-l border-zinc-800 pl-6 last:border-0">
                              <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-zinc-700 ring-4 ring-black" />
                              <div className="flex-1 bg-black/20 p-3 rounded-lg border border-white/5">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="text-xs font-mono text-gray-500">
                                          {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: log.stoolColor }} />
                                  </div>
                                  <div className="font-bold text-sm text-gray-200">
                                      Type {log.stoolType}: {bristolScale.find(b => b.id === log.stoolType)?.desc}
                                  </div>
                                  {log.stoolNotes && (
                                      <div className="text-xs text-gray-500 mt-1 italic">&quot;{log.stoolNotes}&quot;</div>
                                  )}
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>
      
    </div>
  )
}

interface RecoveryFormValues {
  sleepStart: string;
  sleepEnd: string;
  morningVitality: boolean;
  sleepQuality: number;
}

function RecoveryModule({ stats }: { stats: BioStats[] }) {
  const { register, handleSubmit, watch, setValue, reset } = useForm<RecoveryFormValues>();
  const vitality = watch("morningVitality");
  const sleepQuality = watch("sleepQuality");
  
  // Charts Data
  const chartData = stats.slice(-7).map(s => ({
      date: s.date.split("-").slice(1).join("/"),
      quality: s.sleep
  }));

  const onSubmit = async (data: RecoveryFormValues) => {
    // Parse times
    const today = new Date();
    // Simple parsing assumption for HH:MM input
    const [startH, startM] = (data.sleepStart || "00:00").split(":");
    const [endH, endM] = (data.sleepEnd || "00:00").split(":");
    
    const sleepStart = new Date(today);
    sleepStart.setHours(Number(startH), Number(startM), 0);

    const sleepEnd = new Date(today);
    sleepEnd.setHours(Number(endH), Number(endM), 0);

    // Handle crossing midnight for sleepStart
    if (sleepStart > sleepEnd) {
         sleepStart.setDate(sleepStart.getDate() - 1);
    }
    
    await logBio({
        date: new Date(), 
        sleepStart,
        sleepEnd,
        morningVitality: data.morningVitality,
        sleepQuality: Number(data.sleepQuality),
    });
    toast.success("Recovery Logged");
    reset();
  };

  return (
    <div className="space-y-6">
        {/* CHART */}
       <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl">
            <h3 className="text-xs font-bold text-gray-500 mb-4 flex items-center gap-2">
                <Moon className="w-4 h-4"/> SLEEP QUALITY TREND
            </h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorQuality" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="date" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} domain={[0, 5]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: "#111", border: "1px solid #333" }}
                            itemStyle={{ fontSize: "12px" }}
                        />
                        <Area type="monotone" dataKey="quality" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorQuality)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
       </div>

      <div className="bg-gray-900/30 border border-white/5 p-6 rounded-xl">
        <h3 className="text-lg font-semibold flex items-center mb-6"><Moon className="w-5 h-5 mr-2 text-rose-500"/> SLEEP & HORMONAL</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-xs text-gray-500">BED TIME</label>
                 <input {...register("sleepStart")} type="time" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:border-rose-500 outline-none text-white appearance-none" />
              </div>
              <div className="space-y-2">
                 <label className="text-xs text-gray-500">WAKE TIME</label>
                 <input {...register("sleepEnd")} type="time" className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm focus:border-rose-500 outline-none text-white appearance-none" />
              </div>
           </div>

           <div className="space-y-3">
             <label className="text-xs text-gray-500 uppercase">MORNING VITALITY</label>
             <button
               type="button"
               onClick={() => setValue("morningVitality", !vitality)}
               className={`w-full py-3 rounded-lg flex items-center justify-center space-x-2 transition-all ${vitality ? "bg-rose-900/50 text-rose-400 border border-rose-500/50" : "bg-gray-800 text-gray-500 hover:bg-gray-700"}`}
             >
               <Flame className={`w-5 h-5 ${vitality ? "fill-rose-500" : ""}`} />
               <span>{vitality ? "DETECTED" : "NOT DETECTED"}</span>
             </button>
           </div>
           
           <div className="space-y-3">
             <label className="text-xs text-gray-500 uppercase">Rested Feeling (1-5)</label>
             <div className="grid grid-cols-5 gap-2">
               {[
                 { val: 1, emoji: "🧟", label: "GROGGY" },
                 { val: 2, emoji: "😫", label: "TIRED" },
                 { val: 3, emoji: "😐", label: "OK" },
                 { val: 4, emoji: "🙂", label: "GOOD" },
                 { val: 5, emoji: "⚡", label: "OPTIMAL" }
               ].map((level) => (
                 <button
                   key={level.val}
                   type="button"
                   onClick={() => setValue("sleepQuality", level.val)}
                   className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                     Number(sleepQuality) === level.val 
                       ? "bg-rose-900/50 border-rose-500 text-white scale-105" 
                       : "bg-black/40 border-white/5 text-gray-500 hover:bg-white/5 hover:border-white/20"
                   }`}
                 >
                   <span className="text-2xl mb-1">{level.emoji}</span>
                   <span className="text-[10px] font-bold">{level.label}</span>
                 </button>
               ))}
             </div>
             <input type="hidden" {...register("sleepQuality")} />
           </div>

           <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-black font-bold py-2 rounded transition-colors">SYNC DATA</button>
        </form>
      </div>
    </div>
  )
}
