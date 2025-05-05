import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create users
  await prisma.user.createMany({
    data: [
      {
        username: 'test',
        email: 'test@example.com',
        password: '$2a$10$dBIwKQN8vM5TapBn/pxVNOwI/dY7wdHm5HrPJNfl/2K2.Gw4tbMTq', // "test123"
        role: 'user'
      },
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: '$2a$10$dBIwKQN8vM5TapBn/pxVNOwI/dY7wdHm5HrPJNfl/2K2.Gw4tbMTq', // "password123"
        role: 'user'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: '$2a$10$dBIwKQN8vM5TapBn/pxVNOwI/dY7wdHm5HrPJNfl/2K2.Gw4tbMTq',
        role: 'user'
      },
      {
        username: 'admin_mike',
        email: 'mike@example.com',
        password: '$2a$10$dBIwKQN8vM5TapBn/pxVNOwI/dY7wdHm5HrPJNfl/2K2.Gw4tbMTq',
        role: 'admin'
      },
      {
        username: 'sarah_k',
        email: 'sarah@example.com',
        password: '$2a$10$dBIwKQN8vM5TapBn/pxVNOwI/dY7wdHm5HrPJNfl/2K2.Gw4tbMTq',
        role: 'user'
      },
      {
        username: 'coach_dave',
        email: 'dave@example.com',
        password: '$2a$10$dBIwKQN8vM5TapBn/pxVNOwI/dY7wdHm5HrPJNfl/2K2.Gw4tbMTq',
        role: 'admin'
      }
    ],
    skipDuplicates: true
  });

  // Create sports halls
  const halls = await prisma.hall.createMany({
    data: [
      {
        id: 'hall-1',
        name: 'Olympic Center',
        description: 'Multi-purpose sports hall with professional equipment',
        location: 'North Campus, Building A',
        sportType: 'Multi-purpose',
        capacity: 500,
        openingHours: '08:00-22:00',
        constructionYear: 2010,
        isAccessible: true
      },
      {
        id: 'hall-2',
        name: 'Basketball Arena',
        description: 'Professional basketball court with seating',
        location: 'East Campus, Athletic Complex',
        sportType: 'Basketball',
        capacity: 300,
        openingHours: '09:00-21:00',
        constructionYear: 2015,
        isAccessible: true
      },
      {
        id: 'hall-3',
        name: 'Aquatic Center',
        description: 'Olympic-size swimming pool',
        location: 'South Campus, Recreation Building',
        sportType: 'Swimming',
        capacity: 150,
        openingHours: '07:00-20:00',
        constructionYear: 2018,
        isAccessible: true
      },
      {
        id: 'hall-4',
        name: 'Tennis Courts',
        description: 'Outdoor clay tennis courts',
        location: 'West Campus, Outdoor Area',
        sportType: 'Tennis',
        capacity: 100,
        openingHours: '08:00-18:00',
        constructionYear: 2012,
        isAccessible: false
      },
      {
        id: 'hall-5',
        name: 'Fitness Center',
        description: 'Modern gym with cardio and weight equipment',
        location: 'Central Campus, Student Union',
        sportType: 'Fitness',
        capacity: 200,
        openingHours: '06:00-23:00',
        constructionYear: 2020,
        isAccessible: true
      }
    ],
    skipDuplicates: true
  });

  // Create time slots (for today and tomorrow only)
  const timeSlots = [];
  const hallIds = ['hall-1', 'hall-2', 'hall-3', 'hall-4', 'hall-5'];
  
  for (const hallId of hallIds) {
    // Create 2 slots per hall - one for today, one for tomorrow
    for (let day = 0; day < 2; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      date.setHours(9, 0, 0, 0); // 9 AM start
      
      const startTime = new Date(date);
      const endTime = new Date(date);
      endTime.setHours(startTime.getHours() + 2); // 2 hour slot
      
      timeSlots.push({
        id: `${hallId}-day${day}`,
        sportsHallId: hallId,
        startTime,
        endTime,
        isAvailable: true
      });
    }
  }

  await prisma.timeSlot.createMany({
    data: timeSlots,
    skipDuplicates: true
  });

  // Create one test booking
  const users = await prisma.user.findMany();
  const firstSlot = timeSlots[0];

  if (users.length > 0) {
    await prisma.booking.create({
      data: {
        userId: users[0].id,
        timeSlotId: firstSlot.id,
        purpose: 'Test Booking',
        notes: 'Initial test booking'
      }
    });

    // Mark the slot as unavailable
    await prisma.timeSlot.update({
      where: { id: firstSlot.id },
      data: { isAvailable: false }
    });
  }

  console.log('✅ Database seeded successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });