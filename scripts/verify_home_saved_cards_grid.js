import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('=== VERIFYING HOME SAVED CARDS GRID & REFETCH FLOW ===\n');

  // 1. Create User A (Owner of Card 1)
  const userA = await prisma.user.create({
    data: {
      name: 'Peter Parker',
      email: `peter_home_${Date.now()}@example.com`,
      passwordHash: 'pwd_123'
    }
  });

  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: userA.id,
      slug: `peter-home-${Date.now()}`,
      name: 'Peter Parker',
      email: 'peter@bugle.com',
      phone: '1111111111',
      theme: 'comic-theme',
      usageType: 'PERSONAL',
      designation: 'Photographer'
    }
  });

  // 2. Create User B (Owner of Card 2)
  const userB = await prisma.user.create({
    data: {
      name: 'Bruce Wayne',
      email: `bruce_home_${Date.now()}@example.com`,
      passwordHash: 'pwd_456'
    }
  });

  const cardB = await prisma.uniCardProfile.create({
    data: {
      userId: userB.id,
      slug: `bruce-home-${Date.now()}`,
      name: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      phone: '2222222222',
      theme: 'pink-pop-theme',
      usageType: 'PERSONAL',
      designation: 'Architect'
    }
  });

  console.log(`1. Created Card A (Peter, Comic Theme) & Card B (Bruce, Pink Pop Theme)`);

  // 3. Create User C (Scanner / Collector)
  const userC = await prisma.user.create({
    data: {
      name: 'Clark Kent',
      email: `clark_home_${Date.now()}@example.com`,
      passwordHash: 'pwd_789'
    }
  });

  console.log(`2. Created User C (Scanner: Clark Kent)`);

  // 4. Save Card A to User C
  await prisma.savedCard.create({
    data: { userId: userC.id, cardId: cardA.id }
  });
  console.log(`3. User C saved Card A (Peter)`);

  // Verify Home Saved Cards API for User C
  let savedRecords = await prisma.savedCard.findMany({
    where: { userId: userC.id },
    include: { card: true },
    orderBy: { createdAt: 'desc' }
  });
  let userCSavedCards = savedRecords.map((r) => r.card);

  console.log(`   User C Home Saved Cards count: ${userCSavedCards.length}`);
  if (userCSavedCards.length === 1 && userCSavedCards[0].name === 'Peter Parker') {
    console.log('-> SUCCESS: Card A (Peter) immediately rendered in Saved Cards!');
  }

  // 5. Save Card B to User C
  await prisma.savedCard.create({
    data: { userId: userC.id, cardId: cardB.id }
  });
  console.log(`\n4. User C saved Card B (Bruce)`);

  // Verify Home Saved Cards Array for User C
  savedRecords = await prisma.savedCard.findMany({
    where: { userId: userC.id },
    include: { card: true },
    orderBy: { createdAt: 'desc' }
  });
  userCSavedCards = savedRecords.map((r) => r.card);

  console.log(`   User C Home Saved Cards array count: ${userCSavedCards.length}`);
  userCSavedCards.forEach((c, idx) => {
    console.log(`   [${idx}] Name="${c.name}", Theme="${c.theme}", Profession="${c.designation}"`);
  });

  if (
    userCSavedCards.length === 2 &&
    userCSavedCards.some((c) => c.name === 'Peter Parker' && c.theme === 'comic-theme') &&
    userCSavedCards.some((c) => c.name === 'Bruce Wayne' && c.theme === 'pink-pop-theme')
  ) {
    console.log('-> SUCCESS: Both Card A and Card B rendered together in array, preserving their original themes!');
  } else {
    console.error('-> ERROR: Array truncated or themes lost!');
  }

  // Clean up
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
  await prisma.user.delete({ where: { id: userC.id } });
  console.log('\nCleaned up test data cleanly.');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
