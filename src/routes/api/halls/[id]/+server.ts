import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const hall = await prisma.hall.findUnique({
      where: { id: params.id },
      include: {
        timeSlots: {
          where: {
            startTime: {
              gte: new Date()
            }
          },
          orderBy: {
            startTime: 'asc'
          }
        }
      }
    });

    if (!hall) {
      return json({ error: 'Hall not found' }, { status: 404 });
    }

    return json({
      ...hall,
      timeSlots: hall.timeSlots.map(slot => ({
        ...slot,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString()
      })),
      isReserved: hall.timeSlots.some(slot => !slot.isAvailable)
    });
  } catch (error) {
    console.error('Error fetching hall:', error);
    return json({ error: 'Failed to fetch hall details' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request, params }) => {
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

    // Check if hall exists
    const existingHall = await prisma.hall.findUnique({
      where: { id: params.id }
    });

    if (!existingHall) {
      return json({ error: 'Hall not found' }, { status: 404 });
    }

    const hall = await prisma.hall.update({
      where: { id: params.id },
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
        timeSlots: {
          where: {
            startTime: {
              gte: new Date()
            }
          }
        }
      }
    });

    return json(hall);
  } catch (error: any) {
    console.error('Error updating hall:', error);
    if (error.code === 'P2002') {
      return json({ error: 'A hall with this name already exists' }, { status: 400 });
    }
    return json({ error: 'Failed to update hall' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, params }) => {
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

    // Check if hall exists and has any active bookings
    const hall = await prisma.hall.findUnique({
      where: { id: params.id },
      include: {
        timeSlots: {
          include: {
            bookings: true
          }
        }
      }
    });

    if (!hall) {
      return json({ error: 'Hall not found' }, { status: 404 });
    }

    // Check for active bookings
    const hasActiveBookings = hall.timeSlots.some(slot => 
      slot.bookings.length > 0 && new Date(slot.startTime) >= new Date()
    );

    if (hasActiveBookings) {
      return json({ 
        error: 'Cannot delete hall with active bookings' 
      }, { status: 400 });
    }

    // Delete all time slots and the hall
    await prisma.$transaction([
      prisma.timeSlot.deleteMany({
        where: { sportsHallId: params.id }
      }),
      prisma.hall.delete({
        where: { id: params.id }
      })
    ]);

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting hall:', error);
    return json({ error: 'Failed to delete hall' }, { status: 500 });
  }
};