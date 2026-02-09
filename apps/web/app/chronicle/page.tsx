import { ReportCard } from "@/components/chronicle/ReportCard";
import { getWeeklyReport } from "@/actions/chronicle";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

import { generateBriefing } from "@/actions/ai";

export default async function ChroniclePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [report, briefing] = await Promise.all([
    getWeeklyReport(),
    generateBriefing()
  ]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-8 space-y-12">
      <Link href="/dashboard" className="self-start flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
        <MoveLeft size={16} />
        <span className="text-xs font-mono uppercase tracking-widest">Return to Base</span>
      </Link>

      {report ? (
        <ReportCard data={report} briefing={briefing} />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-4 py-24 border border-zinc-900 bg-zinc-950/50 w-full max-w-2xl rounded-xl">
             <div className="text-6xl animate-pulse grayscale">📡</div>
             <h2 className="text-xl font-bold text-zinc-700 tracking-widest uppercase">No Data Detected</h2>
             <p className="text-xs font-mono text-zinc-600">Execute Protocol to generate telemetry.</p>
        </div>
      )}
    </div>
  );
}
