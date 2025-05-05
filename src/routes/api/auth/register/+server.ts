import type { RequestHandler } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import bcrypt from 'bcryptjs';

export const POST: RequestHandler = async ({ request }) => {
  const { email, username, password } = await request.json();
  if (!email || !username || !password) {
    return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    await prisma.user.create({
      data: {
        email,
            username, // use username field
        password: passwordHash, // use password field
      }
    });
    return new Response(JSON.stringify({ success: true }), { status: 201 });
  } catch (e: any) {
    console.error('Registration error:', e);
    let message = 'User already exists or invalid data.';
    if (e.code === 'P2002') {
      message = 'Email or username already exists.';
    }
    return new Response(JSON.stringify({ error: message }), { status: 400 });
  }
};