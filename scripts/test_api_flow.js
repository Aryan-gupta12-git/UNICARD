import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runTest() {
  console.log('=== VERIFYING DYNAMIC PROFESSION FIELD PERSISTENCE ===\n');

  // 1. Create fresh test user
  const user = await prisma.user.create({
    data: {
      name: 'Profession Test User',
      email: `test_prof_${Date.now()}@example.com`,
      passwordHash: 'hashed_pwd_123'
    }
  });

  console.log(`1. Created User ID: ${user.id}`);

  // 2. Create Card A (Peter Parker - Profession: Photographer)
  const cardA = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `peter-${Date.now()}`,
      name: 'Peter Parker',
      email: 'peter@dailybugle.com',
      phone: '1111111111',
      theme: 'comic-theme',
      usageType: 'PERSONAL',
      designation: 'Photographer'
    }
  });
  console.log(`2. Created Card A: Name=${cardA.name}, Profession/Designation="${cardA.designation}"`);

  // 3. Create Card B (Bruce Wayne - Profession: Architect)
  const cardB = await prisma.uniCardProfile.create({
    data: {
      userId: user.id,
      slug: `bruce-${Date.now()}`,
      name: 'Bruce Wayne',
      email: 'bruce@wayneenterprises.com',
      phone: '2222222222',
      theme: 'pink-pop-theme',
      usageType: 'PERSONAL',
      designation: 'Architect'
    }
  });
  console.log(`3. Created Card B: Name=${cardB.name}, Profession/Designation="${cardB.designation}"`);

  // 4. Fetch each card by ID from database and verify profession is card-specific
  const fetchCardA = await prisma.uniCardProfile.findFirst({
    where: { id: cardA.id, userId: user.id }
  });
  const fetchCardB = await prisma.uniCardProfile.findFirst({
    where: { id: cardB.id, userId: user.id }
  });

  console.log('\n=== VERIFYING PROFESSION FIELD VALUES ===');
  console.log(`  Peter Parker Profession: "${fetchCardA.designation}"`);
  console.log(`  Bruce Wayne Profession: "${fetchCardB.designation}"`);

  if (fetchCardA.designation === 'Photographer' && fetchCardB.designation === 'Architect') {
    console.log('-> SUCCESS: Profession is correctly saved and card-specific!');
  } else {
    console.error('-> ERROR: Profession mismatch!');
  }

  // 5. Test editing Bruce's profession to "Product Designer"
  const updatedBruce = await prisma.uniCardProfile.update({
    where: { id: cardB.id },
    data: { designation: 'Product Designer' }
  });

  const refetchedA = await prisma.uniCardProfile.findFirst({ where: { id: cardA.id } });
  const refetchedB = await prisma.uniCardProfile.findFirst({ where: { id: cardB.id } });

  console.log('\n=== AFTER EDITING BRUCE PROFESSION TO "Product Designer" ===');
  console.log(`  Peter Parker Profession: "${refetchedA.designation}"`);
  console.log(`  Bruce Wayne Profession: "${refetchedB.designation}"`);

  if (refetchedA.designation === 'Photographer' && refetchedB.designation === 'Product Designer') {
    console.log('-> SUCCESS: Editing Bruce updated ONLY Bruce! Peter remains "Photographer"!');
  } else {
    console.error('-> ERROR: Edit leaked to other cards!');
  }

  // Clean up test user
  await prisma.user.delete({ where: { id: user.id } });
  console.log('\nCleaned up test user cleanly.');
  await prisma.$disconnect();
}

runTest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
