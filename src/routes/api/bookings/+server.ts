import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
  const auth = request.headers.get('authorization');
  if (!auth) return json({ error: 'Unauthorized' }, { status: 401 });
  
  const token = auth.split(' ')[1];
  const payload = verifyJwt(token);
  const userId = (typeof payload === 'object' && payload !== null && 'userId' in payload) ? (payload as any).userId : undefined;
  
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: Number(userId) },
      include: {
        timeSlot: {
          include: {
            sportsHall: true
          }
        },
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: [
        {
          timeSlot: {
            startTime: 'desc'
          }
        }
      ]
    });

    return json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  const auth = request.headers.get('authorization');
  if (!auth) return json({ error: 'Unauthorized' }, { status: 401 });
  
  const token = auth.split(' ')[1];
  const payload = verifyJwt(token);
  const userId = (typeof payload === 'object' && payload !== null && 'userId' in payload) ? (payload as any).userId : undefined;
  
  if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { hallId, startTime, endTime, purpose, notes } = data;

    // Validate required fields
    if (!hallId || !startTime || !endTime || !purpose) {
      return json({ error: 'Required fields are missing' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    const booking = await prisma.$transaction(async (tx) => {
      // Check for overlapping bookings
      const existingBooking = await tx.booking.findFirst({
        where: {
          timeSlot: {
            sportsHallId: hallId,
            AND: [
              {
                startTime: {
                  lte: new Date(endTime)
                }
              },
              {
                endTime: {
                  gte: new Date(startTime)
                }
              }
            ]
          }
        },
        include: {
          timeSlot: true
        }
      });

      if (existingBooking) {
        throw new Error('This time slot is already booked');
      }

      // Create time slot
      const timeSlot = await tx.timeSlot.create({
        data: {
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isAvailable: false,
          sportsHallId: hallId
        }
      });

      // Create booking
      return await tx.booking.create({
        data: {
          userId: Number(userId),
          timeSlotId: timeSlot.id,
          purpose,
          notes
        },
        include: {
          timeSlot: {
            include: {
              sportsHall: true
            }
          },
          user: {
            select: {
              username: true
            }
          }
        }
      });
    });

    // Return the created booking
    return json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return json({ 
      error: error.message === 'This time slot is already booked'
        ? error.message 
        : 'Failed to create booking' 
    }, { status: 400 });
  }
};