"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";

export async function drawOracleCard() {
  const cards = await prisma.oracleCard.findMany();
  
  if (cards.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * cards.length);
  return cards[randomIndex];
}

export async function acknowledgeOracle() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const STOIC_PERK_ID = "state_control";
  const XP_AMOUNT = 5;

  // Update XP
  const userPerk = await prisma.userPerk.upsert({
    where: {
      userId_perkId: {
        userId: user.id,
        perkId: STOIC_PERK_ID,
      },
    },
    create: { userId: user.id, perkId: STOIC_PERK_ID, xp: XP_AMOUNT },
    update: { xp: { increment: XP_AMOUNT } },
  });

  // Check Level Up
  // Level Formula matching daily.ts: Level = floor(xp / 100) + 1
  const newLevel = Math.floor(userPerk.xp / 100) + 1;
  let levelUpMessage = null;

  if (newLevel > userPerk.level) {
    await prisma.userPerk.update({
      where: { id: userPerk.id },
      data: { level: newLevel },
    });
    // Fetch label for message
    const perk = await prisma.perk.findUnique({ where: { id: STOIC_PERK_ID } });
    levelUpMessage = `${perk?.label || "STATE CONTROL"} UPGRADED TO LEVEL ${newLevel}`;
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");

  return {
    success: true,
    xpAdded: XP_AMOUNT,
    levelUp: levelUpMessage,
  };
}
