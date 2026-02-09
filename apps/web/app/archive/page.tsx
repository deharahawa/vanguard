import { TacticalCalendar } from "@/components/archive/TacticalCalendar";
import { getMonthlyCalendar } from "@/actions/history";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MoveLeft } from "lucide-react";

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const year = searchParams.year ? parseInt(searchParams.year) : now.getFullYear();
  const month = searchParams.month ? parseInt(searchParams.month) : now.getMonth() + 1;

  const calendarData = await getMonthlyCalendar(year, month);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 space-y-12">
      <Link
        href="/dashboard"
        className="self-start flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
      >
        <MoveLeft size={16} />
        <span className="text-xs font-mono uppercase tracking-widest">Return to Base</span>
      </Link>

      <div className="w-full max-w-4xl space-y-6">
        <header>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">The Archive</h1>
            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Historical Performance Database</p>
        </header>

        <TacticalCalendar data={calendarData} year={year} month={month} />

        {/* Vault (Future Expansion) */}
        <div className="border-t border-zinc-900 pt-8 opacity-50 pointer-events-none">
            <h3 className="text-xs font-bold text-zinc-700 uppercase tracking-widest mb-4">Chronicle Vault [LOCKED]</h3>
            <div className="space-y-2">
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex justify-between items-center">
                    <span className="text-zinc-600 font-mono text-xs">WEEK 42: THE BEGINNING</span>
                    <span className="text-zinc-800 text-[10px] uppercase">Encrypted</span>
                </div>
                 <div className="p-4 bg-zinc-950 border border-zinc-900 rounded flex justify-between items-center">
                    <span className="text-zinc-600 font-mono text-xs">WEEK 43: MOMENTUM</span>
                    <span className="text-zinc-800 text-[10px] uppercase">Encrypted</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
