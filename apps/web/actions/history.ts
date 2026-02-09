"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";

export type CalendarDay = {
  date: string; // ISO String
  adherence: number;
  mood: number;
  hasJournal: boolean;
  id: string;
};

export async function getMonthlyCalendar(year: number, month: number): Promise<CalendarDay[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Construct start and end date for the query
  // Note: Month is 0-indexed in JS Date, but humans usually pass 1-12. 
  // Let's assume input is 1-12 (January = 1).
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  // Fetch metrics
  const logs = await prisma.dailyMetrics.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  // Transform to simplified format
  return logs.map((log) => {
    let checkCount = 0;
    if (log.hydration) checkCount++;
    if (log.breathing) checkCount++;
    if (log.mobility) checkCount++;
    if (log.reset) checkCount++;
    
    // Max 4 core metrics for adherence calculation in this context (excluding Diplomat for now to keep it consistent with legacy logic, or include it? 
    // The prompt implied 80% thresholds. Use 4 items = 25% each. 
    // Wait, Slice 4 (Trinity) added Diplomat. Metrics are 5 items now.
    // 5 items: 20% each. 4/5 = 80%. Perfect.
    if (log.diplomat) checkCount++;

    const adherence = Math.round((checkCount / 5) * 100);

    return {
      date: log.date.toISOString(),
      adherence,
      mood: log.mood,
      hasJournal: !!log.summary && log.summary.trim().length > 0,
      id: log.id,
    };
  });
}
