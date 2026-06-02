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

      const prev = queryClient.getQueryData<NutritionSettings>(SETTINGS_KEY);

      queryClient.setQueryData<NutritionSettings>(SETTINGS_KEY, (old) =>
        old ? { ...old, ...payload } : old,
      );

      return { prev };
    },

    onError: (_err, _payload, context) => {
      if (context?.prev) {
        queryClient.setQueryData(SETTINGS_KEY, context.prev);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });

      // חשוב כדי שמסך הבית ישקף מיד את ההעדפות החדשות
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["daily-log"] });
      queryClient.invalidateQueries({ queryKey: ["today-log"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      settingsApi.updateProfile(payload),

    onSuccess: (updatedUser) => {
      if (currentUser) {
        setAuthenticated({ ...currentUser, ...updatedUser });
      }

      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
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
  const setUnauthenticated = useAuthStore((s) => s.setUnauthenticated);
  const queryClient = useQueryClient();

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
