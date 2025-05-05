import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { signJwt } from '$lib/server/jwt';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request }) => {
  const { username, password } = await request.json();
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
  }
  const token = signJwt({ userId: user.id, username: user.username, role: user.role });
  return new Response(JSON.stringify({ token }), { status: 200 });
};