import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  // This should compile if types are correct
  const session = await prisma.workoutSession.create({
    data: {
      userId: 'test',
      type: 'LIFT',
      isTemplate: true, // Checking this property
      sets: {
        create: []
      }
    }
  });
}

main();
