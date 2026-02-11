"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";

const PERKS = [
  { id: "bio_engine", label: "Bio-Engine", category: "OPERATOR", description: "Maintains biological systems." },
  { id: "state_control", label: "State Control", category: "STOIC", description: "Regulates nervous system." },
  { id: "tribal_glue", label: "Tribal Glue", category: "DIPLOMAT", description: "Strengthens social bonds." },
];

async function ensurePerksExist() {
  for (const perk of PERKS) {
    await prisma.perk.upsert({
      where: { id: perk.id },
      update: {},
      create: perk,
    });
  }
}

export async function logDailyMetrics(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Ensure perks exist (Lazy seeding)
  await ensurePerksExist();

  const hydration = formData.get("hydration") === "on";
  const breathing = formData.get("breathing") === "on";
  const mobility = formData.get("mobility") === "on";
  const reset = formData.get("reset") === "on";
  const diplomat = formData.get("diplomat") === "on";
  const bio_engine = formData.get("bio_engine") === "on";
  const mood = Number(formData.get("mood"));
  const summary = String(formData.get("summary"));

  const today = new Date();
   today.setHours(0, 0, 0, 0);

  // 1. Fetch current state to check for diffs
  const currentMetric = await prisma.dailyMetrics.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  // 2. Calculate XP Gains
  const xpEvents = [];
  const XP_AMOUNT = 10;

  // Bio-Engine (Hydration, Mobility)
  if (hydration && !currentMetric?.hydration) xpEvents.push("bio_engine");
  if (mobility && !currentMetric?.mobility) xpEvents.push("bio_engine");

  // State Control (Breathing, Reset)
  if (breathing && !currentMetric?.breathing) xpEvents.push("state_control");
  if (reset && !currentMetric?.reset) xpEvents.push("state_control");

  // Tribal Glue (Diplomat)
  if (diplomat && !currentMetric?.diplomat) xpEvents.push("tribal_glue");

  // 3. Apply XP and Check for Level Ups
  let levelUpMessage: string | null = null;

  for (const perkId of xpEvents) {
    const userPerk = await prisma.userPerk.upsert({
      where: {
        userId_perkId: {
          userId: user.id,
          perkId: perkId,
        },
      },
      create: { userId: user.id, perkId, xp: XP_AMOUNT },
      update: { xp: { increment: XP_AMOUNT } },
    });

    // Check Level Up (Threshold: Level * 100)
    // Level 1: 0-99
    // Level 2: 100-199
    // Level 3: 200-299
    const newLevel = Math.floor(userPerk.xp / 100) + 1;
    
    if (newLevel > userPerk.level) {
      await prisma.userPerk.update({
        where: { id: userPerk.id },
        data: { level: newLevel },
      });
      const perk = PERKS.find(p => p.id === perkId);
      levelUpMessage = `${perk?.label} UPGRADED TO LEVEL ${newLevel}`;
    }
  }

  // 4. Save Metrics
  await prisma.dailyMetrics.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      hydration,
      breathing,
      mobility,
      reset,
      diplomat,
      bio_engine,
      mood,
      summary,
    },
    create: {
      userId: user.id,
      date: today,
      hydration,
      breathing,
      mobility,
      reset,
      diplomat,
      bio_engine,
      mood,
      summary,
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    xpGained: xpEvents.length > 0,
    levelUp: levelUpMessage,
  };
}
