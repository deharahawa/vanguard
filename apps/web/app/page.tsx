import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default async function LandingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-12">
        <div className="space-y-4">
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">
            Vanguard
            <br />
            <span className="text-zinc-600">Protocol</span>
          </h1>
          <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
            System Online // Awaiting Input
          </p>
        </div>

        <div className="space-y-4">
            <Link
            href="/login"
            className="group flex items-center justify-center gap-4 w-full bg-white text-black font-black uppercase tracking-widest py-4 hover:bg-zinc-200 transition-colors"
            >
            Enter System
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
             <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
