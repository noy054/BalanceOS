import { apiClient } from '../../../shared/api/client';
import { NUTRITION_SETTINGS_ENDPOINTS } from '../constants';
import { NutritionSettings, UpsertNutritionSettingsPayload } from '../types';

export const nutritionSettingsApi = {
  getSettings(): Promise<NutritionSettings | null> {
    return apiClient
      .get<NutritionSettings | null>(NUTRITION_SETTINGS_ENDPOINTS.BASE)
      .then((r) => r.data);
  },

  upsertSettings(
    payload: UpsertNutritionSettingsPayload,
  ): Promise<NutritionSettings> {
    return apiClient
      .patch<NutritionSettings>(NUTRITION_SETTINGS_ENDPOINTS.BASE, payload)
      .then((r) => r.data);
  },
};
