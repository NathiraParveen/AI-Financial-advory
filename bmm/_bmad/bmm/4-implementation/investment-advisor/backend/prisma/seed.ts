import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  const user1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: await bcrypt.hash('password123', 10),
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      passwordHash: await bcrypt.hash('password123', 10),
    },
  })

  console.log('✅ Users created:', user1.email, user2.email)
  console.log('')
  console.log('Test accounts:')
  console.log('  📧 john@example.com  /  password123')
  console.log('  📧 jane@example.com  /  password123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
