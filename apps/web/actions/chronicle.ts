"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";

export type WeeklyReport = {
  startDate: Date;
  endDate: Date;
  adherence: number;
  averageMood: number;
  breakdown: {
    hydration: number;
    breathing: number;
    mobility: number;
    reset: number;
  };
  logs: { date: Date; summary: string }[];
};

export async function getWeeklyReport(): Promise<WeeklyReport | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6); // Last 7 days including today

  // Normalize to start of day for query
  const queryStartDate = new Date(startDate);
  queryStartDate.setHours(0, 0, 0, 0);

  const logs = await prisma.dailyMetrics.findMany({
    where: {
      userId: user.id,
      date: {
        gte: queryStartDate,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  if (logs.length === 0) {
    return null;
  }

  // Aggregation Logic
  const totalDays = 7;
  const maxPossibleChecks = totalDays * 4; // 4 habits per day
  let totalChecks = 0;
  let totalMood = 0;
  let moodCount = 0;

  const breakdown = {
    hydration: 0,
    breathing: 0,
    mobility: 0,
    reset: 0,
  };

  const textLogs: { date: Date; summary: string }[] = [];

  logs.forEach((log) => {
    if (log.hydration) {
        totalChecks++;
        breakdown.hydration++;
    }
    if (log.breathing) {
        totalChecks++;
        breakdown.breathing++;
    }
    if (log.mobility) {
        totalChecks++;
        breakdown.mobility++;
    }
    if (log.reset) {
        totalChecks++;
        breakdown.reset++;
    }

    if (log.mood > 0) {
      totalMood += log.mood;
      moodCount++;
    }

    if (log.summary) {
      textLogs.push({ date: log.date, summary: log.summary });
    }
  });

  const adherence = Math.round((totalChecks / maxPossibleChecks) * 100);
  const averageMood = moodCount > 0 ? Number((totalMood / moodCount).toFixed(1)) : 0;

  return {
    startDate,
    endDate,
    adherence,
    averageMood,
    breakdown,
    logs: textLogs,
  };
}
