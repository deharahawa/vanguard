import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@vanguard/db";
import { getQuadriviumStats } from "@/actions/stats";
import Quadrivium from "@/components/dashboard/Quadrivium";
import { OracleWidget } from "@/components/dashboard/OracleWidget";
import { QuickAccess } from "@/components/dashboard/QuickAccess";
import { ProtocolCard } from "@/components/daily/ProtocolCard";

export const dynamic = "force-dynamic";

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
    getQuadriviumStats()
  ]);

  // Serialize metrics to prevent hydration issues with Date objects
  const metricsJson = metrics ? JSON.parse(JSON.stringify(metrics)) : null;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <header className="flex flex-col md:flex-row justify-between items-center pb-8 border-b border-zinc-900 gap-8 w-full">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Command Center</h1>
              <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">Vanguard Protocol // Active</p>
            </div>
        </header>

        <div className="w-full flex flex-col items-center gap-8">
          <Quadrivium stats={stats} />
          <QuickAccess />
          <OracleWidget />
          <ProtocolCard initialMetrics={metricsJson} />
        </div>
      </div>
    </div>
  );
}
