"use server";

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@vanguard/db";
import { revalidatePath } from "next/cache";

export type Rank = "RECRUIT" | "OPERATOR I" | "OPERATOR II" | "VANGUARD" | "MASTER";

export async function getProfileData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Fetch Profile
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  // Fetch Perks
  let userPerks = await prisma.userPerk.findMany({
    where: { userId: user.id },
    include: { perk: true },
  });

  // Self-Healing: Ensure all perks exist for the user
  const REQUIRED_PERKS = ["bio_engine", "state_control", "tribal_glue"];
  const missingPerks = REQUIRED_PERKS.filter(id => !userPerks.find(p => p.perkId === id));

  if (missingPerks.length > 0) {
    for (const perkId of missingPerks) {
       await prisma.userPerk.upsert({
          where: {
            userId_perkId: {
                userId: user.id,
                perkId,
            }
          },
          create: { userId: user.id, perkId, xp: 0, level: 1 },
          update: {},
       });
    }
    // Re-fetch to get the fresh data with relations
    userPerks = await prisma.userPerk.findMany({
        where: { userId: user.id },
        include: { perk: true },
    });
  }

  // Calculate Total Level
  const totalLevel = userPerks.reduce((sum, p) => sum + p.level, 0);

  // Determine Rank
  let rankTitle: Rank = "RECRUIT";
  if (totalLevel >= 30) rankTitle = "MASTER";
  else if (totalLevel >= 16) rankTitle = "VANGUARD";
  else if (totalLevel >= 6) rankTitle = "OPERATOR II";
  else if (totalLevel >= 1) rankTitle = "OPERATOR I";

  // If no profile, we can return null codename or create one on the fly. 
  // Let's just return what we have.
  
  return {
    user,
    profile,
    perks: userPerks,
    totalLevel,
    rankTitle,
  };
}

export async function updateIdentity(formData: FormData) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const codename = String(formData.get("codename")).trim().toUpperCase();
    const bio = String(formData.get("bio")).trim();

    await prisma.profile.upsert({
        where: { userId: user.id },
        update: { codename, bio },
        create: { userId: user.id, codename, bio }
    });

    revalidatePath("/profile");
}
