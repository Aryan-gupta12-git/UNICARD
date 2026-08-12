import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('=== VERIFYING UNICARD 3-CARD VIEW & DELETE FLOW ===\n');

  // 1. Create fresh test user
  const email = `test_flow_${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      name: 'Flow Test User',
      email,
      passwordHash: 'hashed_pwd_123'
    }
  });

  console.log(`1. Created User ID: ${user.id}`);

  // 2. Create Card 1 (Peter Parker - comic-theme)
  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `peter-${Date.now()}`,
      name: 'Peter Parker',
      email: 'peter@test.com',
      phone: '1111111111',
      theme: 'comic-theme',
      usageType: 'PERSONAL'
    }
  });

  // 3. Create Card 2 (Bruce Wayne - pink-pop-theme)
  const cardB = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `bruce-${Date.now()}`,
      name: 'Bruce Wayne',
      email: 'bruce@test.com',
      phone: '2222222222',
      theme: 'pink-pop-theme',
      usageType: 'BUSINESS',
      businessName: 'Wayne Enterprises'
    }
  });

  // 4. Create Card 3 (Clark Kent - comic-theme)
  const cardC = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `clark-${Date.now()}`,
      name: 'Clark Kent',
      email: 'clark@test.com',
      phone: '3333333333',
      theme: 'comic-theme',
      usageType: 'BUSINESS',
      businessName: 'Daily Planet'
    }
  });

  console.log('Created 3 cards successfully:');
  console.log(`  - Peter: ID=${cardA.id}, Theme=${cardA.theme}`);
  console.log(`  - Bruce: ID=${cardB.id}, Theme=${cardB.theme}`);
  console.log(`  - Clark: ID=${cardC.id}, Theme=${cardC.theme}`);

  // 5. Test opening each card independently by ID
  const fetchCardA = await prisma.uniCardProfile.findFirst({
    where: { id: cardA.id, userId: user.id }
  });
  const fetchCardB = await prisma.uniCardProfile.findFirst({
    where: { id: cardB.id, userId: user.id }
  });
  const fetchCardC = await prisma.uniCardProfile.findFirst({
    where: { id: cardC.id, userId: user.id }
  });

  console.log('\n=== VERIFYING INDIVIDUAL CARD FETCH BY ID ===');
  console.log(`  Peter fetch: Name="${fetchCardA.name}", Email="${fetchCardA.email}", Theme="${fetchCardA.theme}"`);
  console.log(`  Bruce fetch: Name="${fetchCardB.name}", Email="${fetchCardB.email}", Theme="${fetchCardB.theme}"`);
  console.log(`  Clark fetch: Name="${fetchCardC.name}", Email="${fetchCardC.email}", Theme="${fetchCardC.theme}"`);

  if (
    fetchCardA.name === 'Peter Parker' &&
    fetchCardB.name === 'Bruce Wayne' &&
    fetchCardC.name === 'Clark Kent'
  ) {
    console.log('-> SUCCESS: Each card opened with ITS OWN saved details and theme!');
  } else {
    console.error('-> ERROR: Card details leaked!');
  }

  // 6. Test deleting Card B (Bruce Wayne)
  console.log('\n=== TESTING DELETE CARD B (BRUCE WAYNE) ===');
  await prisma.uniCardProfile.delete({
    where: { id: cardB.id }
  });
  console.log(`Deleted Card B (ID=${cardB.id}).`);

  // 7. Verify database cards for user after deletion
  const remainingCards = await prisma.uniCardProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\nRemaining cards in database (${remainingCards.length} total):`);
  remainingCards.forEach((c) => {
    console.log(`  - ID=${c.id} | Name=${c.name} | Theme=${c.theme}`);
  });

  if (
    remainingCards.length === 2 &&
    remainingCards.some((c) => c.name === 'Peter Parker') &&
    remainingCards.some((c) => c.name === 'Clark Kent') &&
    !remainingCards.some((c) => c.name === 'Bruce Wayne')
  ) {
    console.log('\n-> SUCCESS: Bruce deleted! Peter and Clark remain completely untouched in database!');
  } else {
    console.error('\n-> ERROR: Deletion failed or corrupted other cards!');
  }

  // Clean up test user
  await prisma.user.delete({ where: { id: user.id } });
  console.log('Cleaned up test user cleanly.\n');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
