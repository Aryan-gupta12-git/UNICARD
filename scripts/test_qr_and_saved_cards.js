import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('=== VERIFYING QR SHARING & SAVED CARDS END-TO-END FLOW ===\n');

  // 1. Create User A (Owner)
  const userA = await prisma.user.create({
    data: {
      name: 'User A (Owner)',
      email: `user_a_${Date.now()}@example.com`,
      passwordHash: 'hashed_pwd_123'
    }
  });
  console.log(`1. Created User A ID: ${userA.id}`);

  // 2. User A creates Card A (Peter Parker - comic-theme - Photographer)
  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: userA.id,
      slug: `peter-x${Date.now()}`,
      name: 'Peter Parker',
      email: 'peter@test.com',
      phone: '1111111111',
      theme: 'comic-theme',
      usageType: 'PERSONAL',
      designation: 'Photographer',
      website: 'https://peterparker.photo'
    }
  });
  console.log(`2. Created Card A (Slug=${cardA.slug}, Theme=${cardA.theme}, Profession=${cardA.designation})`);

  // 3. Create User B (Scanner)
  const userB = await prisma.user.create({
    data: {
      name: 'User B (Scanner)',
      email: `user_b_${Date.now()}@example.com`,
      passwordHash: 'hashed_pwd_456'
    }
  });
  console.log(`3. Created User B ID: ${userB.id}`);

  // 4. User B saves Card A ("Let Us Save")
  const savedRecord = await prisma.savedCard.create({
    data: {
      userId: userB.id,
      cardId: cardA.id
    },
    include: { card: true }
  });

  console.log(`4. Saved Card A to User B account. SavedCard ID: ${savedRecord.id}`);
  console.log(`   Saved Card Theme: ${savedRecord.card.theme}`);
  console.log(`   Saved Card Profession: ${savedRecord.card.designation}`);

  if (savedRecord.card.theme === 'comic-theme' && savedRecord.card.designation === 'Photographer') {
    console.log('-> SUCCESS: Saved Card preserved original theme (Comic) and details (Photographer)!');
  } else {
    console.error('-> ERROR: Theme or details corrupted on save!');
  }

  // 5. Verify Duplicate Save Protection (@@unique([userId, cardId]))
  console.log('\n=== TESTING DUPLICATE SAVE PROTECTION ===');
  try {
    await prisma.savedCard.create({
      data: {
        userId: userB.id,
        cardId: cardA.id
      }
    });
    console.error('-> ERROR: Duplicate save was allowed!');
  } catch (err) {
    console.log('-> SUCCESS: Duplicate save prevented by @@unique([userId, cardId]) constraint!');
  }

  // 6. Verify User B's Saved Cards list
  const userBSavedCards = await prisma.savedCard.findMany({
    where: { userId: userB.id },
    include: { card: true }
  });

  console.log(`\nUser B Saved Cards count: ${userBSavedCards.length}`);
  console.log(`Saved Card Name: ${userBSavedCards[0].card.name}`);

  if (userBSavedCards.length === 1 && userBSavedCards[0].card.name === 'Peter Parker') {
    console.log('-> SUCCESS: User B has Peter Parker in Saved Cards!');
  }

  // Clean up test users & cards
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
  console.log('\nCleaned up test data cleanly.');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
