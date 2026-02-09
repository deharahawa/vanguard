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
    orderBy: {
      date: "asc", 
    },
  });

  if (logs.length === 0) {
    return "No telemetry data detected. Execute protocol to initiate analysis.";
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

  if (cachedBriefing && cachedBriefing.updatedAt > lastLogUpdate) {
    return cachedBriefing.content;
  }

  // Quick Stats
  const totalDays = 7;
  const maxPossible = totalDays * 4; 
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

  // Compressed prompt with Direct Tone
  const prompt = `Role:Tactical Mentor. UserStats:Adherence ${adherence}%. Logs:${summaryText}. Task:Analyze performance. Speak DIRECTLY to user ("You"). <50% adherence: stern/encourage. >80%: commend/warn. ID patterns. Max 3 sentences. Text only.`;

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
