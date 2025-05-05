import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';

export const GET: RequestHandler = async ({ params }) => {
  const booking = await prisma.booking.findUnique({
    where: { id: Number(params.id) },
    include: { timeSlot: { include: { sportsHall: true } }, user: true }
  });
  if (!booking) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(booking));
};

export const PUT: RequestHandler = async ({ request, params }) => {
  const auth = request.headers.get('authorization');
  if (!auth) return new Response('Unauthorized', { status: 401 });
  const token = auth.split(' ')[1];
  const payload = verifyJwt(token);
  if (!payload) return new Response('Unauthorized', { status: 401 });
  const data = await request.json();
  const booking = await prisma.booking.update({
    where: { id: Number(params.id) },
    data,
    include: { timeSlot: true }
  });
  return new Response(JSON.stringify(booking));
};

export const DELETE: RequestHandler = async ({ request, params }) => {
  const auth = request.headers.get('authorization');
  if (!auth) return new Response('Unauthorized', { status: 401 });
  const token = auth.split(' ')[1];
  const payload = verifyJwt(token);
  if (!payload) return new Response('Unauthorized', { status: 401 });

  try {
    // Use a transaction to handle both booking and time slot
    await prisma.$transaction(async (tx) => {
      // Get the booking with its time slot
      const booking = await tx.booking.findUnique({
        where: { id: Number(params.id) },
        include: { timeSlot: true }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Delete the booking
      await tx.booking.delete({
        where: { id: Number(params.id) }
      });

      // Check if this was the only booking for this time slot
      const otherBookings = await tx.booking.count({
        where: {
          timeSlotId: booking.timeSlotId,
          id: { not: Number(params.id) }
        }
      });

      if (otherBookings === 0) {
        // If no other bookings exist for this time slot, mark it as available
        await tx.timeSlot.update({
          where: { id: booking.timeSlotId },
          data: { isAvailable: true }
        });
      }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return new Response('Failed to delete booking', { status: 500 });
  }
};