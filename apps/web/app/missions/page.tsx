import { generateDailyBriefing, completeBacklogItem, getBacklog, addToBacklog, deleteBacklogItem } from "@/actions/briefing";
import { CheckCircle, Plus, Trash2, Ghost, Target } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function MissionsPage() {
    const briefing = await generateDailyBriefing();
    const backlog = await getBacklog();

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pb-32">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-white">Missions</h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Tactical Objectives</p>
            </header>

            <div className="max-w-2xl mx-auto flex flex-col gap-12">
                {/* Active Mission */}
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
                               "use server";
                               if (briefing.mission) {
                                   await completeBacklogItem(briefing.mission.id);
                                   revalidatePath("/missions");
                               }
                           }}>
                               <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-widest rounded-lg transition-all hover:scale-105 shadow-lg shadow-red-900/20 text-xs">
                                   <CheckCircle size={16} /> Mark Complete
                               </button>
                           </form>
                        </div>
                    ) : (
                         <div className="bg-zinc-900/30 border border-zinc-800 border-dashed p-6 rounded-2xl text-center">
                            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">No Active Directives.</p>
                        </div>
                    )}
                </section>

                {/* The Void */}
                <section>
                    <div className="flex items-center gap-2 mb-4 text-purple-500">
                        <Ghost className="w-5 h-5" />
                        <h2 className="font-bold uppercase tracking-widest text-sm">The Void (Backlog)</h2>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6">
                        <AddMissionForm />

                        <div className="flex flex-col gap-2 mt-8">
                            {backlog.length === 0 && (
                                <p className="text-center text-zinc-600 text-xs uppercase tracking-widest py-8">The Void is silent.</p>
                            )}
                            {backlog.map((item) => (
                                <div key={item.id} className="group flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg hover:border-zinc-700 transition-colors">
                                    <span className="text-zinc-300 font-mono text-sm">{item.content}</span>
                                    <form action={async () => {
                                        "use server";
                                        await deleteBacklogItem(item.id);
                                        revalidatePath("/missions");
                                    }}>
                                        <button className="text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2">
                                            <Trash2 size={16} />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function AddMissionForm() {
    return (
        <form action={async (formData) => {
            "use server";
            const content = String(formData.get("content"));
            await addToBacklog(content);
            revalidatePath("/missions");
        }} className="flex gap-2">
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
