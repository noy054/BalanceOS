import { create } from 'zustand';
import { UserPublic } from '../types';

type AuthState = {
  isAuthenticated: boolean;
  isHydrating: boolean;
  isLanguageReady: boolean;
  hasSelectedLanguage: boolean;
  user: UserPublic | null;
  setAuthenticated: (user: UserPublic) => void;
  setUnauthenticated: () => void;
  setLanguageReady: (hasSelected: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrating: true,
  isLanguageReady: false,
  hasSelectedLanguage: false,
  user: null,
  setAuthenticated: (user) => set({ isAuthenticated: true, isHydrating: false, user }),
  setUnauthenticated: () => set({ isAuthenticated: false, isHydrating: false, user: null }),
  setLanguageReady: (hasSelected) =>
    set({ isLanguageReady: true, hasSelectedLanguage: hasSelected }),
}));
