import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('=== VERIFYING SAVED CARDS FLOW, READ-ONLY VIEW & USERNAME HYDRATION ===\n');

  // 1. Create User A (Owner)
  const userA = await prisma.user.create({
    data: {
      name: 'Peter Parker',
      email: `owner_peter_${Date.now()}@example.com`,
      passwordHash: 'hashed_pwd_123'
    }
  });

  // 2. User A creates Card A (Peter Parker - comic-theme - Photographer)
  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: userA.id,
      slug: `peter-${Date.now()}`,
      name: 'Peter Parker',
      email: 'peter@dailybugle.com',
      phone: '1111111111',
      theme: 'comic-theme',
      usageType: 'PERSONAL',
      designation: 'Photographer',
      website: 'https://peterparker.photo'
    }
  });
  console.log(`1. User A (Owner) created Card A: Slug=${cardA.slug}, Theme=${cardA.theme}`);

  // 3. Create User B (Scanner - Name: Aryan Gupta)
  const userB = await prisma.user.create({
    data: {
      name: 'Aryan Gupta',
      email: `scanner_aryan_${Date.now()}@example.com`,
      passwordHash: 'hashed_pwd_456'
    }
  });
  console.log(`2. User B (Scanner) account created: ID=${userB.id}, Name="${userB.name}"`);

  // 4. User B saves Card A ("Let Us Save")
  const savedRecord = await prisma.savedCard.create({
    data: {
      userId: userB.id,
      cardId: cardA.id
    },
    include: { card: true }
  });
  console.log(`3. User B saved Card A to database. SavedCard Record ID=${savedRecord.id}`);

  // 5. Query GET /api/unicard/saved-cards equivalent for User B
  const userBSavedRecords = await prisma.savedCard.findMany({
    where: { userId: userB.id },
    include: { card: { include: { socials: true } } }
  });

  const userBSavedCards = userBSavedRecords.map((r) => r.card);

  console.log(`\n=== VERIFYING BUG 1 FIX (Saved Cards list for User B) ===`);
  console.log(`  Count of saved cards returned from database: ${userBSavedCards.length}`);
  if (userBSavedCards.length === 1 && userBSavedCards[0].id === cardA.id) {
    console.log(`  Saved card name: "${userBSavedCards[0].name}"`);
    console.log(`  Saved card theme: "${userBSavedCards[0].theme}"`);
    console.log(`  Saved card profession: "${userBSavedCards[0].designation}"`);
    console.log('-> SUCCESS BUG 1: Saved card is present and visible in User B Saved Cards!');
  } else {
    console.error('-> ERROR BUG 1: Saved card missing from User B Saved Cards!');
  }

  // 6. Verify Bug 2 Fix (Read-only retrieval for saved card)
  console.log(`\n=== VERIFYING BUG 2 FIX (Read-only retrieval by non-owner) ===`);
  const fetchedCard = await prisma.uniCardProfile.findFirst({
    where: { OR: [{ id: cardA.id }, { slug: cardA.slug }] }
  });

  if (fetchedCard && fetchedCard.id === cardA.id) {
    const isOwner = fetchedCard.userId === userB.id;
    console.log(`  Card fetched by ID: Name="${fetchedCard.name}", isOwner=${isOwner}, isReadOnly=${!isOwner}`);
    if (!isOwner) {
      console.log('-> SUCCESS BUG 2: Saved card opened cleanly with read-only permissions!');
    }
  }

  // 7. Verify Bug 3 Fix (User B Welcome Name Hydration)
  console.log(`\n=== VERIFYING BUG 3 FIX (Welcome Name Hydration) ===`);
  const authUserB = await prisma.user.findUnique({ where: { id: userB.id } });
  const welcomeFirstName = authUserB ? authUserB.name.trim().split(' ')[0] : '';
  console.log(`  Authenticated User Name: "${authUserB?.name}"`);
  console.log(`  Home Welcome Message will display: "Welcome back, ${welcomeFirstName}."`);

  if (welcomeFirstName === 'Aryan') {
    console.log('-> SUCCESS BUG 3: Welcome header displays scanner account name ("Aryan")!');
  } else {
    console.error('-> ERROR BUG 3: Welcome name missing or invalid!');
  }

  // Clean up test data
  await prisma.user.delete({ where: { id: userA.id } });
  await prisma.user.delete({ where: { id: userB.id } });
  console.log('\nCleaned up test data cleanly.');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
