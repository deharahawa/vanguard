"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { type QuadriviumStats } from "@/types/stats";

export async function getQuadriviumStats(): Promise<QuadriviumStats | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const logs = await prisma.dailyMetrics.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
      },
    },
  });

  if (logs.length === 0) {
      return { operator: 0, stoic: 0, diplomat: 0, bio: 0 };
  }

  /*
    Scoring:
    Operator: Hydration (1) + Mobility (1) = Max 2 per day * 7 days = 14
    Stoic: Breath (1) + Reset (1) = Max 2 per day * 7 days = 14
    Diplomat: Diplomat (1) = Max 1 per day * 7 days = 7
    Bio: Bio-Engine (1) = Max 1 per day * 7 days = 7
  */

  let opCount = 0;
  let stcCount = 0;
  let dipCount = 0;
  let bioCount = 0;

  logs.forEach(log => {
      if (log.hydration) opCount++;
      if (log.mobility) opCount++;
      
      if (log.breathing) stcCount++;
      if (log.reset) stcCount++;
      
      if (log.diplomat) dipCount++;

      if (log.bio_engine) bioCount++;
  });

  // Calculate percentages (0-100)
  const opMax = 7 * 2;
  const stcMax = 7 * 2;
  const dipMax = 7 * 1; 
  const bioMax = 7 * 1;

  const operator = Math.round((opCount / opMax) * 100);
  const stoic = Math.round((stcCount / stcMax) * 100);
  const diplomat = Math.round((dipCount / dipMax) * 100);
  const bio = Math.round((bioCount / bioMax) * 100);

  return { operator, stoic, diplomat, bio };
}
