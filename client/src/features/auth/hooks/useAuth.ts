import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../../../shared/api/tokenStorage';
import { useAuthStore } from './useAuthStore';
import {
  GoogleLoginPayload,
  LoginPayload,
  RegisterPayload,
} from '../types';

export function useRegister() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: async (data) => {
      await tokenStorage.saveTokens(data.accessToken, data.refreshToken);
      setAuthenticated(data.user);
      router.replace('/');
    },
  });
}

export function useLogin() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: async (data) => {
      await tokenStorage.saveTokens(data.accessToken, data.refreshToken);
      setAuthenticated(data.user);
      router.replace('/');
    },
  });
}

export function useGoogleLogin() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);

  return useMutation({
    mutationFn: (payload: GoogleLoginPayload) => authApi.googleLogin(payload),
    onSuccess: async (data) => {
      await tokenStorage.saveTokens(data.accessToken, data.refreshToken);
      setAuthenticated(data.user);
      router.replace('/');
    },
  });
}

export function useLogout() {
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: async () => {
      await tokenStorage.clearTokens();
      setUnauthenticated();
      router.replace('/(auth)/login');
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
