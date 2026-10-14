import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

import { settingsApi } from "../api/settingsApi";
import { tokenStorage } from "../../../shared/api/tokenStorage";
import { useAuthStore } from "../../auth/hooks/useAuthStore";
import {
  ChangePasswordPayload,
  NutritionSettings,
  UpdateProfilePayload,
  UpdateSettingsPayload,
} from "../types";

const SETTINGS_KEY = ["nutrition-settings"];

export function useNutritionSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => settingsApi.getSettings(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) =>
      settingsApi.updateSettings(payload),

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: SETTINGS_KEY });

      const previousSettings =
        queryClient.getQueryData<NutritionSettings>(SETTINGS_KEY);

      queryClient.setQueryData<NutritionSettings>(SETTINGS_KEY, (old) =>
        old ? { ...old, ...payload } : old,
      );

      return { previousSettings };
    },

    onError: (_error, _payload, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(SETTINGS_KEY, context.previousSettings);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["daily-log"] });
      queryClient.invalidateQueries({ queryKey: ["today-log"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      settingsApi.updateProfile(payload),

    onSuccess: (updatedUser) => {
      if (currentUser) {
        setAuthenticated({ ...currentUser, ...updatedUser });
      }

      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      settingsApi.changePassword(payload),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const setUnauthenticated = useAuthStore((state) => state.setUnauthenticated);

  return useMutation({
    mutationFn: () => settingsApi.deleteAccount(),

    onSuccess: async () => {
      await tokenStorage.clearTokens();
      queryClient.clear();
      setUnauthenticated();
      router.replace("/language");
    },
  });
}
