import { writable } from 'svelte/store';

interface AuthState {
  loggedIn: boolean;
  role?: string;
  userId?: number;
  token?: string;
}

function getStoredAuth(): AuthState {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return { loggedIn: false };
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(getStoredAuth());

  return {
    subscribe,
    set: (state: AuthState) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify(state));
      }
      set(state);
    },
    login: (token: string) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const state = {
          loggedIn: true,
          role: payload.role,
          userId: payload.userId,
          token
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth', JSON.stringify(state));
          localStorage.setItem('jwt', token);
        }
        set(state);
      } catch (e) {
        console.error('Failed to parse token:', e);
      }
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
        localStorage.removeItem('jwt');
      }
      set({ loggedIn: false });
    }
  };
}

export const auth = createAuthStore();