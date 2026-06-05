import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, ApiUser } from '../services/api';

export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User extends ApiUser {
  role: UserRole;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      error: null,
      loading: false,

      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const { token, user } = await apiLogin(email, password);
          set({ user: user as User, token, loading: false });
          return true;
        } catch (e: unknown) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      register: async (name, email, password, phone) => {
        set({ loading: true, error: null });
        try {
          const { token, user } = await apiRegister(name, email, password, phone);
          set({ user: user as User, token, loading: false });
          return true;
        } catch (e: unknown) {
          set({ error: (e as Error).message, loading: false });
          return false;
        }
      },

      logout: () => set({ user: null, token: null, error: null }),

      clearError: () => set({ error: null }),

      setUser: (user) => set({ user }),
    }),
    { name: 'afromarket-auth' }
  )
);
