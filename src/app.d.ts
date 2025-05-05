// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { PrismaClient } from '@prisma/client';

declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				email: string;
				name: string;
				role: string;
			};
			message?: string;
		}
	}
	// eslint-disable-next-line no-var
	var prisma: PrismaClient;
}

export {};
