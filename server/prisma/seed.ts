import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@invoicecanada.com' },
    update: {},
    create: {
      email: 'demo@invoicecanada.com',
      password: hashedPassword,
      businessName: 'Demo Consulting Inc.',
      businessNumber: '123456789RT0001',
      firstName: 'John',
      lastName: 'Doe',
      phone: '(416) 555-0100',
      address: '123 Main Street',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5H 2N2',
      subscriptionTier: 'professional',
    },
  });

  console.log(`✅ Created demo user: ${user.email}`);

  // Create demo clients
  const client1 = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '(416) 555-0200',
      businessName: 'Smith & Associates',
      address: '456 Queen St W',
      city: 'Toronto',
      province: 'ON',
      postalCode: 'M5V 2A4',
      paymentTerms: 30,
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: user.id,
      name: 'Bob Johnson',
      email: 'bob@techcorp.ca',
      businessName: 'TechCorp Solutions',
      address: '789 Granville Street',
      city: 'Vancouver',
      province: 'BC',
      postalCode: 'V6C 1T2',
      paymentTerms: 15,
    },
  });

  console.log(`✅ Created ${2} demo clients`);

  // Create demo invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client1.id,
      invoiceNumber: 'INV-0001',
      issueDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-31'),
      province: 'ON',
      status: 'SENT',
      paymentStatus: 'UNPAID',
      subtotal: 100000, // $1,000.00
      taxAmount: 13000, // $130.00 (13% HST)
      total: 113000, // $1,130.00
      notes: 'Consulting services for January 2024',
      terms: 'Payment due within 30 days',
      items: {
        create: [
          {
            description: 'Web Development Services',
            quantity: 10,
            rate: 10000, // $100.00/hour
            amount: 100000,
            order: 0,
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      userId: user.id,
      clientId: client2.id,
      invoiceNumber: 'INV-0002',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-01-30'),
      province: 'BC',
      status: 'PAID',
      paymentStatus: 'PAID',
      subtotal: 250000, // $2,500.00
      taxAmount: 30000, // $300.00 (12% GST+PST)
      total: 280000, // $2,800.00
      amountPaid: 280000,
      notes: 'Custom software development',
      paidAt: new Date('2024-01-20'),
      items: {
        create: [
          {
            description: 'Custom Application Development',
            quantity: 20,
            rate: 12500, // $125.00/hour
            amount: 250000,
            order: 0,
          },
        ],
      },
    },
  });

  // Add payment for invoice 2
  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      amount: 280000,
      paidAt: new Date('2024-01-20'),
      method: 'E-Transfer',
      reference: 'REF-12345',
    },
  });

  console.log(`✅ Created ${2} demo invoices`);

  console.log('✨ Seeding completed successfully!');
  console.log('\n📧 Demo login credentials:');
  console.log('   Email: demo@invoicecanada.com');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
