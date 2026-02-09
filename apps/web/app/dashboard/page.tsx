import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { ScrollText, Archive, User } from "lucide-react";
import Link from "next/link";
import { ProtocolCard } from "@/components/daily/ProtocolCard";
import { SignOutButton } from "@/components/auth/SignOutButton";

import { prisma } from "@vanguard/db";
import { getTrinityStats } from "@/actions/stats";
import { TrinityHexagon } from "@/components/dashboard/TrinityHexagon";

export default async function Dashboard() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [metrics, stats] = await Promise.all([
    prisma.dailyMetrics.findUnique({
        where: {
        userId_date: {
            userId: user.id,
            date: today,
        },
        },
    }),
    getTrinityStats()
  ]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <header className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-zinc-900 gap-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Command Center</h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Vanguard Protocol // Active</p>
        </div>
        <div className="flex gap-4">
            <Link href="/archive" className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                <Archive size={16} /> Archive
            </Link>
            <Link href="/chronicle" className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                <ScrollText size={16} /> Chronicle
            </Link>
             <Link href="/profile" className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
                <User size={16} /> ID
            </Link>
            <SignOutButton />
        </div>
      </header>

        <div className="w-full flex flex-col items-center gap-8">
          <TrinityHexagon stats={stats} />
          <ProtocolCard initialMetrics={metrics as any} />
        </div>
      </div>
    </div>
  );
}
