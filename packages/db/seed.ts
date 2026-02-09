
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PERKS = [
  { id: "bio_engine", label: "Bio-Engine", category: "OPERATOR", description: "Maintains biological systems." },
  { id: "state_control", label: "State Control", category: "STOIC", description: "Regulates nervous system." },
  { id: "tribal_glue", label: "Tribal Glue", category: "DIPLOMAT", description: "Strengthens social bonds." },
];

async function main() {
  console.log("🌱 Seeding Perks...");

  for (const perk of PERKS) {
    await prisma.perk.upsert({
      where: { id: perk.id },
      update: perk,
      create: perk,
    });
    console.log(`- Upserted: ${perk.label}`);
  }

  console.log("✅ Seeding Complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
