import { generateDailyBriefing, getBacklog } from "@/actions/briefing";
import { getOperations } from "@/actions/operations";
import { MissionsView } from "@/components/missions/MissionsView";

export default async function MissionsPage() {
    const briefing = await generateDailyBriefing();
    const backlog = await getBacklog();
    const operations = await getOperations();

    return (
        <MissionsView 
            briefing={briefing}
            backlog={backlog}
            operations={operations}
        />
    );
}
