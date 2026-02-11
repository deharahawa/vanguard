import { StreamFeed } from "@/components/stream/StreamFeed";
import { Radio } from "lucide-react";
import { AnalogGate } from "@/components/gate/AnalogGate";
import { checkCommsStatus } from "@/actions/gate";

export const dynamic = "force-dynamic";

export default async function StreamPage() {
    const gateStatus = await checkCommsStatus();

    return (
        <AnalogGate initialStatus={gateStatus}>
            <div className="min-h-screen bg-black p-4 md:p-8 space-y-8">
                <header className="flex items-center gap-4 border-b border-zinc-900 pb-6">
                    <div className="p-3 bg-zinc-900 rounded-xl">
                        <Radio className="w-6 h-6 text-white animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Intelligence Stream</h1>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                            Live Data Feed // Encrypted
                        </p>
                    </div>
                </header>

                <StreamFeed />
            </div>
        </AnalogGate>
    );
}
