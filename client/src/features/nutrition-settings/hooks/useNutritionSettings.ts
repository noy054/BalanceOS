import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nutritionSettingsApi } from '../api/nutritionSettingsApi';
import { UpsertNutritionSettingsPayload } from '../types';
import { useAuthStore } from '../../auth/hooks/useAuthStore';

const SETTINGS_KEY = ['nutrition-settings'];

export function useNutritionSettings() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: () => nutritionSettingsApi.getSettings(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useUpsertNutritionSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertNutritionSettingsPayload) =>
      nutritionSettingsApi.upsertSettings(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(SETTINGS_KEY, data);
    },
  });
}
