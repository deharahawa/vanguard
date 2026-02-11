import { getSeasons, type Badge } from "@/actions/season";
import { Award, Hexagon } from "lucide-react";

export async function ServiceRecord() {
    const seasons = await getSeasons();

    if (seasons.length === 0) return null;

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 text-amber-500">
                <Award size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Service Record</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {seasons.map(season => (
                    <div key={season.id} className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6 rounded-xl flex items-center gap-4 group hover:border-amber-900/50 transition-colors">
                        {/* Season Icon/Badge */}
                        <div className="relative w-16 h-16 flex items-center justify-center">
                             <Hexagon className="w-16 h-16 text-zinc-800 fill-zinc-900 absolute" strokeWidth={1} />
                             <div className="relative z-10 font-black text-2xl text-amber-500">
                                 {season.name.split(' ')[1]} {/* "1" from "Season 1" */}
                             </div>
                        </div>

                        <div className="space-y-1">
                            <h4 className="font-bold text-white text-sm">{season.name}</h4>
                            <p className="text-[10px] mobile-font text-zinc-500 uppercase tracking-widest">
                                Rank: <span className="text-amber-500">{season.rankAchieved}</span>
                            </p>
                            
                            {/* Badges List */}
                            <div className="flex gap-2 mt-2">
                                {season.badges.slice(0, 3).map((badge: Badge) => (
                                    <div key={badge.id} title={badge.name} className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700 text-[10px]">
                                        🏆
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
