import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter: adapter as any });

async function main() {
  console.log('Seeding database...');

  // Hash the super user password
  const hashedPassword = await bcrypt.hash('embassysuper123', 10);

  // Create super user
  const superUser = await prisma.user.upsert({
    where: { email: 'embassysuper@email.com' },
    update: {},
    create: {
      email: 'embassysuper@email.com',
      password: hashedPassword,
      first_name: 'Embassy',
      last_name: 'Super Admin',
      role: 'super_admin',
      is_active: true,
    },
  });

  console.log('Super user created:', superUser.email);

  // Create a sample embassy
  const embassy = await prisma.embassy.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Embassy',
      country: 'Uganda',
      city: 'Kampala',
      address: 'Main Street, Kampala',
      phone: '+256-XXX-XXXXXX',
      email: 'main@embassy.gov',
      is_active: true,
    },
  });

  console.log('Sample embassy created:', embassy.name);
  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
