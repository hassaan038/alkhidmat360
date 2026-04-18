import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@alkhidmat360.com' },
    update: {},
    create: {
      email: 'admin@alkhidmat360.com',
      password: adminPassword,
      fullName: 'Admin User',
      phoneNumber: '+92-300-1234567',
      userType: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created:', { email: admin.email, userType: admin.userType });

  // Create test donor
  const donorPassword = await bcrypt.hash('donor123', 10);

  const donor = await prisma.user.upsert({
    where: { email: 'donor@test.com' },
    update: {},
    create: {
      email: 'donor@test.com',
      password: donorPassword,
      fullName: 'Test Donor',
      phoneNumber: '+92-301-1111111',
      cnic: '12345-1234567-1',
      userType: 'DONOR',
      isActive: true,
    },
  });

  console.log('✅ Test donor created:', { email: donor.email, userType: donor.userType });

  // Create test beneficiary
  const beneficiaryPassword = await bcrypt.hash('beneficiary123', 10);

  const beneficiary = await prisma.user.upsert({
    where: { email: 'beneficiary@test.com' },
    update: {},
    create: {
      email: 'beneficiary@test.com',
      password: beneficiaryPassword,
      fullName: 'Test Beneficiary',
      phoneNumber: '+92-302-2222222',
      cnic: '12345-2222222-2',
      userType: 'BENEFICIARY',
      isActive: true,
    },
  });

  console.log('✅ Test beneficiary created:', { email: beneficiary.email, userType: beneficiary.userType });

  // Create test volunteer
  const volunteerPassword = await bcrypt.hash('volunteer123', 10);

  const volunteer = await prisma.user.upsert({
    where: { email: 'volunteer@test.com' },
    update: {},
    create: {
      email: 'volunteer@test.com',
      password: volunteerPassword,
      fullName: 'Test Volunteer',
      phoneNumber: '+92-303-3333333',
      userType: 'VOLUNTEER',
      isActive: true,
    },
  });

  console.log('✅ Test volunteer created:', { email: volunteer.email, userType: volunteer.userType });

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@alkhidmat360.com / admin123');
  console.log('Donor: donor@test.com / donor123');
  console.log('Beneficiary: beneficiary@test.com / beneficiary123');
  console.log('Volunteer: volunteer@test.com / volunteer123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
