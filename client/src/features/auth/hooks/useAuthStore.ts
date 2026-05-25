import { create } from 'zustand';
import { UserPublic } from '../types';

type AuthState = {
  isAuthenticated: boolean;
  isHydrating: boolean;
  user: UserPublic | null;
  setAuthenticated: (user: UserPublic) => void;
  setUnauthenticated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrating: true,
  user: null,
  setAuthenticated: (user) => set({ isAuthenticated: true, isHydrating: false, user }),
  setUnauthenticated: () => set({ isAuthenticated: false, isHydrating: false, user: null }),
}));
