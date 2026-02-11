import { getBioStats } from "@/actions/bio";
import BioDashboardClient from "@/components/bio/BioDashboardClient";

export const dynamic = "force-dynamic";

export default async function BioDashboardPage() {
    const stats = await getBioStats(30);

    return (
        <BioDashboardClient stats={stats} />
    );
}
