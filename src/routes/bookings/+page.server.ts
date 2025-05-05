import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, url }) => {
  try {
    const token = cookies.get('jwt');
    if (!token) return { bookings: [] };

    const payload = verifyJwt(token);
    if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
      return { bookings: [] };
    }

    const userId = Number(payload.userId);
    const bookings = await prisma.booking.findMany({
      where: { userId },
      orderBy: [
        {
          timeSlot: {
            startTime: 'desc'
          }
        }
      ],
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

    const halls = await prisma.hall.findMany({
      select: {
        id: true,
        name: true,
        openingHours: true
      }
    });

    const hallId = url.searchParams.get('hallId');
    return {
      bookings: bookings.map(booking => ({
        id: booking.id,
        purpose: booking.purpose,
        notes: booking.notes || undefined,
        timeSlot: {
          startTime: booking.timeSlot.startTime.toISOString(),
          endTime: booking.timeSlot.endTime.toISOString(),
          sportsHall: {
            id: booking.timeSlot.sportsHallId,
            name: booking.timeSlot.sportsHall.name,
            location: booking.timeSlot.sportsHall.location
          }
        },
        user: {
          username: booking.user.username
        }
      })),
      halls,
      hallId: hallId || null
    };
  } catch (error) {
    console.error('Error loading bookings:', error);
    return { bookings: [], halls: [], error: 'Failed to load bookings' };
  }
};

export const actions = {
  default: async ({ request }) => {
    try {
      const formData = await request.formData();
      const token = formData.get('auth')?.toString();
      if (!token) return fail(401, { error: 'Please log in' });

      const payload = verifyJwt(token);
      if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
        return fail(401, { error: 'Invalid session' });
      }

      const userId = Number(payload.userId);
      const hallId = formData.get('hallId')?.toString();
      const startTime = formData.get('startTime')?.toString();
      const endTime = formData.get('endTime')?.toString();
      const purpose = formData.get('purpose')?.toString();
      const notes = formData.get('notes')?.toString();

      if (!hallId || !startTime || !endTime || !purpose) {
        return fail(400, { error: 'Required fields are missing' });
      }

      // Create the booking
      const result = await prisma.$transaction(async (tx) => {
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
        await tx.booking.create({
          data: {
            userId: userId,
            timeSlotId: timeSlot.id,
            purpose: purpose.trim(),
            notes: notes?.trim()
          }
        });
      });

      return { success: 'Booking created successfully!', hallId };
    } catch (error: any) {
      console.error('Booking error:', error);
      return fail(400, {
        error: error.message === 'This time slot is already booked'
          ? error.message
          : 'Failed to create booking'
      });
    }
  }
};
