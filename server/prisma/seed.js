import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Test accounts use @gmail.com so they pass the runtime email validator
// (gmail / hotmail / yahoo only). Passwords are intentionally weak — the
// login schema only checks the bcrypt hash, so the strong-password rule
// doesn't apply to existing accounts.

async function main() {
  console.log('🌱 Starting database seeding...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: adminPassword,
      fullName: 'Admin User',
      phoneNumber: '+923001234567',
      userType: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Admin user created:', { email: admin.email, userType: admin.userType });

  const donorPassword = await bcrypt.hash('donor123', 10);
  const donor = await prisma.user.upsert({
    where: { email: 'donor@gmail.com' },
    update: {},
    create: {
      email: 'donor@gmail.com',
      password: donorPassword,
      fullName: 'Test Donor',
      phoneNumber: '+923011111111',
      cnic: '3520212345671',
      userType: 'DONOR',
      isActive: true,
    },
  });
  console.log('✅ Test donor created:', { email: donor.email, userType: donor.userType });

  const beneficiaryPassword = await bcrypt.hash('beneficiary123', 10);
  const beneficiary = await prisma.user.upsert({
    where: { email: 'beneficiary@gmail.com' },
    update: {},
    create: {
      email: 'beneficiary@gmail.com',
      password: beneficiaryPassword,
      fullName: 'Test Beneficiary',
      phoneNumber: '+923022222222',
      cnic: '4210122345678',
      userType: 'BENEFICIARY',
      isActive: true,
    },
  });
  console.log('✅ Test beneficiary created:', { email: beneficiary.email, userType: beneficiary.userType });

  const volunteerPassword = await bcrypt.hash('volunteer123', 10);
  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@gmail.com' },
    update: {},
    create: {
      email: 'volunteer@gmail.com',
      password: volunteerPassword,
      fullName: 'Test Volunteer',
      phoneNumber: '+923033333333',
      userType: 'VOLUNTEER',
      isActive: true,
    },
  });
  console.log('✅ Test volunteer created:', { email: volunteer.email, userType: volunteer.userType });

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin:       admin@gmail.com       / admin123');
  console.log('Donor:       donor@gmail.com       / donor123');
  console.log('Beneficiary: beneficiary@gmail.com / beneficiary123');
  console.log('Volunteer:   volunteer@gmail.com   / volunteer123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
