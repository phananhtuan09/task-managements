import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const digest = createHash('sha256')
    .update(`${salt}:${password}`)
    .digest('hex');

  return `${salt}:${digest}`;
}

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
  const fullName = process.env.SEED_ADMIN_FULL_NAME ?? 'System Admin';

  await prisma.user.upsert({
    where: { email },
    update: {
      fullName,
      passwordHash: hashPassword(password),
    },
    create: {
      email,
      fullName,
      passwordHash: hashPassword(password),
    },
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
