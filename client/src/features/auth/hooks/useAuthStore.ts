import { create } from 'zustand';
import { UserPublic } from '../types';

type AuthState = {
  isAuthenticated: boolean;
  user: UserPublic | null;
  setAuthenticated: (user: UserPublic) => void;
  setUnauthenticated: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuthenticated: (user) => set({ isAuthenticated: true, user }),
  setUnauthenticated: () => set({ isAuthenticated: false, user: null }),
}));
