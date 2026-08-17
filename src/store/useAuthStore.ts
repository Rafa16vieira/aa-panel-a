import { create } from 'zustand';
import type { AuthSession } from '../types';
import { login as loginService, logout as logoutService, restoreSession } from '../services/authService';
import type { LoginResult } from '../services/authLocal';

interface AuthState {
  hydrated: boolean;
  session: AuthSession | null;
  hydrate: () => Promise<void>;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  hydrated: false,
  session: null,

  hydrate: async () => {
    try {
      const result = await restoreSession();
      set({
        hydrated: true,
        session: result.ok ? result.session : null,
      });
    } catch {
      set({ hydrated: true, session: null });
    }
  },

  login: async (username, password) => {
    const result = await loginService(username, password);
    if (result.ok) {
      set({ session: result.session });
    }
    return result;
  },

  logout: async () => {
    await logoutService();
    set({ session: null });
  },
}));
