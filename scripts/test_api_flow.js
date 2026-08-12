import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('=== VERIFYING UNICARD 3-CARD CREATION & API RESPONSE ===\n');

  // 1. Create a fresh test user
  const email = `test_flow_${Date.now()}@example.com`;
  const user = await prisma.user.create({
    data: {
      name: 'Flow Test User',
      email,
      passwordHash: 'hashed_pwd_123'
    }
  });

  console.log(`1. Created User ID: ${user.id} (${user.email})`);

  // 2. Create Card A (Peter)
  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `peter-${Date.now()}`,
      name: 'Peter Parker',
      email: 'peter@dailybugle.com',
      phone: '1234567890',
      theme: 'comic-theme',
      usageType: 'PERSONAL'
    }
  });
  console.log(`2. Created Card A: ID=${cardA.id}, Name=${cardA.name}`);

  // 3. Create Card B (Bruce)
  const cardB = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `bruce-${Date.now()}`,
      name: 'Bruce Wayne',
      email: 'bruce@wayneenterprises.com',
      phone: '9876543210',
      theme: 'pink-pop-theme',
      usageType: 'BUSINESS',
      businessName: 'Wayne Enterprises',
      designation: 'CEO'
    }
  });
  console.log(`3. Created Card B: ID=${cardB.id}, Name=${cardB.name}`);

  // 4. Create Card C (Clark)
  const cardC = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `clark-${Date.now()}`,
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phone: '5551234567',
      theme: 'comic-theme',
      usageType: 'BUSINESS',
      businessName: 'Daily Planet',
      designation: 'Reporter'
    }
  });
  console.log(`4. Created Card C: ID=${cardC.id}, Name=${cardC.name}`);

  // 5. Query PostgreSQL database for user's cards
  const dbCards = await prisma.uniCardProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\n=== DATABASE QUERY RESULT: Found ${dbCards.length} rows for user ===`);
  dbCards.forEach((c, idx) => {
    console.log(`  [Card ${idx + 1}] ID=${c.id} | UserID=${c.userId} | Name=${c.name} | Theme=${c.theme} | Slug=${c.slug}`);
  });

  // 6. Test Edit Bruce Wayne (Card B)
  const updatedBruce = await prisma.uniCardProfile.update({
    where: { id: cardB.id },
    data: { designation: 'Chairman & CEO' }
  });
  console.log(`\n5. Updated Card B (Bruce) designation to: "${updatedBruce.designation}"`);

  // 7. Verify all 3 cards after update
  const finalCards = await prisma.uniCardProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\n=== FINAL VERIFICATION AFTER EDITING BRUCE ===`);
  console.log(`Total rows in PostgreSQL: ${finalCards.length}`);
  finalCards.forEach((c) => {
    console.log(`  - ID=${c.id} | Name=${c.name} | Designation=${c.designation || 'N/A'}`);
  });

  // Clean up test user
  await prisma.user.delete({ where: { id: user.id } });
  console.log('\nCleaned up test user cleanly.');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
