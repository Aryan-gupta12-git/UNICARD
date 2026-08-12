import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Testing Multiple Card Creation in Neon PostgreSQL ---');

  // Find or create test user
  let user = await prisma.user.findFirst({
    where: { email: 'test_multi_cards@example.com' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Test Multi User',
        email: 'test_multi_cards@example.com',
        passwordHash: 'hashed_secret_test_123'
      }
    });
    console.log('Created test user:', user.id);
  } else {
    console.log('Found existing test user:', user.id);
    // Clean up existing test cards for this user
    await prisma.uniCardProfile.deleteMany({
      where: { userId: user.id }
    });
  }

  // Create Card A (Peter)
  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: 'peter-comic-card',
      name: 'Peter Parker',
      email: 'peter@dailybugle.com',
      phone: '1234567890',
      theme: 'comic-theme',
      usageType: 'PERSONAL'
    }
  });
  console.log('Created Card A:', cardA.id, cardA.name, cardA.slug);

  // Create Card B (Bruce)
  const cardB = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: 'bruce-pink-card',
      name: 'Bruce Wayne',
      email: 'bruce@wayneenterprises.com',
      phone: '9876543210',
      theme: 'pink-pop-theme',
      usageType: 'BUSINESS',
      businessName: 'Wayne Enterprises',
      designation: 'CEO'
    }
  });
  console.log('Created Card B:', cardB.id, cardB.name, cardB.slug);

  // Create Card C (Clark)
  const cardC = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: 'clark-daily-planet',
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phone: '5551234567',
      theme: 'comic-theme',
      usageType: 'BUSINESS',
      businessName: 'Daily Planet',
      designation: 'Reporter'
    }
  });
  console.log('Created Card C:', cardC.id, cardC.name, cardC.slug);

  // Fetch all cards for test user
  const allCards = await prisma.uniCardProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`\nFound ${allCards.length} cards in database for user ${user.id}:`);
  console.table(allCards.map(c => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    theme: c.theme,
    slug: c.slug
  })));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
