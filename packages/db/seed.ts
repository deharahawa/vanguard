
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

  console.log("✅ Seeding Perks Complete.");

  console.log("🔮 Seeding Oracle Cards...");
  const ORACLE_CARDS = [
    { content: "Is this necessary?", author: "Marcus Aurelius", category: "STOIC" },
    { content: "What would the best version of myself do right now?", author: "Unknown", category: "TACTICAL" },
    { content: "Am I being a good ancestor?", author: "Jonas Salk", category: "MENTAL_MODEL" },
    { content: "Discipline equals freedom.", author: "Jocko Willink", category: "TACTICAL" },
    { content: "The obstacle is the way.", author: "Ryan Holiday", category: "STOIC" },
    { content: "Memento Mori.", author: "Stoic", category: "STOIC" },
    { content: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius", category: "STOIC" },
    { content: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "MENTAL_MODEL" },
    { content: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", category: "STOIC" },
    { content: "It is not death that a man should fear, but he should fear never beginning to live.", author: "Marcus Aurelius", category: "STOIC" },
    { content: "If it is not right do not do it; if it is not true do not say it.", author: "Marcus Aurelius", category: "STOIC" },
    { content: "The best revenge is to be unlike him who performed the injury.", author: "Marcus Aurelius", category: "STOIC" },
    { content: "We suffer more often in imagination than in reality.", author: "Seneca", category: "STOIC" },
    { content: "No man is free who is not master of himself.", author: "Epictetus", category: "STOIC" },
    { content: "Difficulties strengthen the mind, as labor does the body.", author: "Seneca", category: "STOIC" },
    { content: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus", category: "STOIC" },
    { content: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus", category: "TACTICAL" },
    { content: "Luck is what happens when preparation meets opportunity.", author: "Seneca", category: "TACTICAL" },
    { content: "Silence is a source of great strength.", author: "Lao Tzu", category: "MENTAL_MODEL" },
    { content: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", category: "MENTAL_MODEL" },
  ];

  for (const card of ORACLE_CARDS) {
    await prisma.oracleCard.create({
      data: card,
    });
  }
  console.log("✅ Seeding Oracle Cards Complete.");

  console.log("✅ All Seeding Complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
