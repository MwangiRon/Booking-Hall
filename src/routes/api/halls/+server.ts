import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';

export const GET: RequestHandler = async () => {
  try {
    const halls = await prisma.hall.findMany({
      include: {
        timeSlots: false
      }
    });

    return json(halls);
  } catch (error) {
    console.error('Error fetching halls:', error);
    return json({ error: 'Failed to fetch halls' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const auth = request.headers.get('authorization');
    if (!auth) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = auth.split(' ')[1];
    const payload = verifyJwt(token);
    
    if (!payload || typeof payload !== 'object' || payload.role !== 'admin') {
      return json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'location', 'sportType', 'capacity', 'openingHours', 'constructionYear'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, { status: 400 });
    }

    // Validate capacity and constructionYear
    if (data.capacity < 1) {
      return json({ error: 'Capacity must be at least 1' }, { status: 400 });
    }

    if (data.constructionYear < 1900 || data.constructionYear > new Date().getFullYear()) {
      return json({ error: 'Invalid construction year' }, { status: 400 });
    }

    const hall = await prisma.hall.create({
      data: {
        name: data.name,
        description: data.description,
        location: data.location,
        sportType: data.sportType,
        capacity: data.capacity,
        openingHours: data.openingHours,
        constructionYear: data.constructionYear,
        isAccessible: data.isAccessible ?? true
      },
      include: {
        timeSlots: true
      }
    });

    return json(hall, { status: 201 });
  } catch (error: any) {
    console.error('Error creating hall:', error);
    if (error.code === 'P2002') {
      return json({ error: 'A hall with this name already exists' }, { status: 400 });
    }
    return json({ error: 'Failed to create hall' }, { status: 500 });
  }
};