import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import { verifyJwt } from '$lib/server/jwt';

export const load: PageServerLoad = async ({ cookies }) => {
  try {
    const token = cookies.get('jwt');
    const decodedToken = token ? verifyJwt(token) : null;
    const isAdmin = decodedToken && typeof decodedToken !== 'string' && decodedToken.role === 'admin';

    const halls = await prisma.hall.findMany();

    return {
      halls,
      isAdmin
    };
  } catch (error) {
    console.error('Error loading halls:', error);
    return {
      halls: [],
      isAdmin: false,
      error: 'Failed to load halls'
    };
  }
};