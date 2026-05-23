import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole } from '@equipment-mgmt/shared';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('access_token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('access_token');
        set({ user: null, token: null });
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'auth-store', partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
);
