import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';

export const GET: RequestHandler = async ({ url, request }) => {
  const auth = request.headers.get('authorization');
  if (!auth) return json({ error: 'Unauthorized' }, { status: 401 });
  
  const token = auth.split(' ')[1];
  if (!verifyJwt(token)) return json({ error: 'Unauthorized' }, { status: 401 });

  const hallId = url.searchParams.get('hallId');
  const date = url.searchParams.get('date');
  const startTime = url.searchParams.get('startTime');
  const endTime = url.searchParams.get('endTime');

  if (!hallId || !date) {
    return json({ error: 'Hall ID and date are required' }, { status: 400 });
  }

  try {
    const dateObj = new Date(date);
    let startDateTime = new Date(dateObj);
    let endDateTime = new Date(dateObj);

    if (startTime && endTime) {
      // If specific times are provided, use them
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      startDateTime.setHours(startHour, startMinute, 0, 0);
      endDateTime.setHours(endHour, endMinute, 0, 0);
    } else {
      // Default to whole day
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);
    }

    // Check for any overlapping bookings
    const existingBookings = await prisma.booking.findMany({
      where: {
        timeSlot: {
          sportsHallId: hallId,
          AND: [
            {
              startTime: {
                lte: endDateTime
              }
            },
            {
              endTime: {
                gte: startDateTime
              }
            }
          ]
        }
      }
    });

    // If there are any overlapping bookings, the time slot is not available
    const isAvailable = existingBookings.length === 0;

    return json([{
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      isAvailable
    }]);
  } catch (error) {
    console.error('Error checking availability:', error);
    return json({ error: 'Failed to check availability' }, { status: 500 });
  }
};