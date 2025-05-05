import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';

export const GET: RequestHandler = async ({ request }) => {
  const auth = request.headers.get('authorization');
  if (!auth) return new Response('Unauthorized', { status: 401 });
  const token = auth.split(' ')[1];
  const payload = verifyJwt(token);
  const userId = (typeof payload === 'object' && payload !== null && 'userId' in payload) ? (payload as any).userId : undefined;
  if (!userId) return new Response('Unauthorized', { status: 401 });
  const bookings = await prisma.booking.findMany({
    where: { userId: Number(userId) },
    include: { timeSlot: { include: { sportsHall: true } }, user: true }
  });
  return new Response(JSON.stringify(bookings));
};
