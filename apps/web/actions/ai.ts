"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function generateBriefing() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - daysSinceMonday);
  startDate.setHours(0, 0, 0, 0);

  const daysElapsed = daysSinceMonday + 1;

  const logs = await prisma.dailyMetrics.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
      },
    },
    orderBy: {
      date: "asc", 
    },
  });

  if (logs.length === 0 && daysElapsed > 1) {
    return "No telemetry data detected. Execute protocol to initiate analysis.";
  } else if (logs.length === 0) {
      // It's day 1 and no logs yet
      return "Day 1 of the cycle. Initiate protocols.";
  }

  // Check for existing cache
  const [latestLog] = logs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const lastLogUpdate = latestLog?.updatedAt || new Date(0);

  const cachedBriefing = await prisma.mentorBriefing.findUnique({
    where: {
      userId_weekStartDate: {
        userId: user.id,
        weekStartDate: startDate,
      },
    },
  });

  if (cachedBriefing && cachedBriefing.updatedAt > lastLogUpdate && cachedBriefing.createdAt.toDateString() === today.toDateString()) {
    return cachedBriefing.content;
  }

  // Quick Stats
  const maxPossible = daysElapsed * 4; 
  let totalChecks = 0;
  let summaryText = "";

  logs.forEach(log => {
    if (log.hydration) totalChecks++;
    if (log.mobility) totalChecks++;
    if (log.breathing) totalChecks++;
    if (log.reset) totalChecks++;
    if (log.summary) summaryText += `[${log.date.toISOString().split('T')[0]}]: ${log.summary}\n`;
  });

  const adherence = Math.round((totalChecks / maxPossible) * 100);

  // Context-Aware Prompt
  let prompt = "";
  if (daysElapsed < 5) {
     // SPOTTER MODE
     prompt = `Role:Tactical Spotter. UserStats:Adherence ${adherence}% (Day ${daysElapsed}/7). Logs:${summaryText}. Task:Analyze ONLY today's/recent performance. Be brief(1 sentence). Celebrate specific wins or gently nudge missed habits. Do NOT mention weekly percentages.`;
  } else {
     // GENERAL MODE
     prompt = `Role:Tactical Mentor. UserStats:Adherence ${adherence}% (Day ${daysElapsed}/7). Logs:${summaryText}. Analyze full week. Use weekly percentage. Be strategic. <50%: stern. >80%: commend. Max 3 sentences.`;
  }

  try {
    const { text } = await generateText({
      model: google("gemini-2.5-flash-lite"),
      prompt: prompt,
    });

    // Cache the result
    await prisma.mentorBriefing.upsert({
        where: {
            userId_weekStartDate: {
                userId: user.id,
                weekStartDate: startDate,
            },
        },
        create: {
            userId: user.id,
            weekStartDate: startDate,
            content: text,
        },
        update: {
            content: text,
        },
    });

    return text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    return `Secure connection to Mentor failed. Analysis unavailable. Details: ${String(error)}`;
  }
}
