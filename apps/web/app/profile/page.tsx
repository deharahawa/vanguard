import { getProfileData, updateIdentity } from "@/actions/profile";
import { MoveLeft, User } from "lucide-react";
import Link from "next/link";
import { SkillCard } from "@/components/profile/SkillCard";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  let data;
  try {
    data = await getProfileData();
  } catch (e) {
    redirect("/login");
  }

  const { profile, perks, totalLevel, rankTitle } = data;

  const codename = profile?.codename || "UNKNOWN";
  const bio = profile?.bio || "No manifesto logged.";

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 space-y-12">
      <Link
        href="/dashboard"
        className="self-start flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
      >
        <MoveLeft size={16} />
        <span className="text-xs font-mono uppercase tracking-widest">Return to Base</span>
      </Link>

      <div className="w-full max-w-4xl space-y-8">
        
        {/* Header / Identity Card */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar / Rank */}
            <div className="w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center relative shrink-0">
                <User size={48} className="text-zinc-600" />
                <div className="absolute -bottom-3 bg-white text-black text-[10px] font-black uppercase px-2 py-1 tracking-widest border border-zinc-500">
                    {rankTitle}
                </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4 w-full">
                <form action={updateIdentity} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Codename</label>
                        <input
                            name="codename"
                            defaultValue={codename}
                            placeholder="SET CODENAME"
                            className="bg-transparent text-4xl font-black text-white uppercase tracking-tighter border-b border-transparent hover:border-zinc-800 focus:border-white focus:outline-none w-full placeholder:text-zinc-800 transition-colors"
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest">Manifesto</label>
                        <input
                            name="bio"
                            defaultValue={bio}
                            placeholder="Enter your tactical manifesto..."
                            className="bg-transparent text-sm text-zinc-400 font-mono border-b border-transparent hover:border-zinc-800 focus:border-white focus:outline-none w-full placeholder:text-zinc-800 transition-colors"
                        />
                    </div>
                    <button type="submit" className="text-[10px] bg-zinc-900 text-zinc-400 px-3 py-1 rounded hover:bg-zinc-800 uppercase tracking-widest transition-colors">
                        Update Identity
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="text-right space-y-1 hidden md:block">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Total Level</div>
                <div className="text-6xl font-black text-white tracking-tighter">{totalLevel}</div>
            </div>
        </div>

        {/* Skills Grid */}
        <div className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-900 pb-2">Skill Tree</h3>
            
            {perks.length === 0 ? (
                <div className="p-8 text-center border border-zinc-900 border-dashed rounded-lg text-zinc-600 text-xs font-mono">
                    NO SKILL DATA DETECTED. INITIATE PROTOCOLS TO BUILD PROFILE.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {perks.map((p: any) => (
                        <SkillCard 
                            key={p.perkId}
                            label={p.perk.label} // Joined via include
                            level={p.level}
                            xp={p.xp}
                            category={p.perk.category}
                        />
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}
