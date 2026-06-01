import { apiClient } from '../../../shared/api/client';
import { NutritionSettings, UpdateSettingsPayload, UpdateProfilePayload, ChangePasswordPayload } from '../types';
import { UserPublic } from '../../auth/types';

const NUTRITION_SETTINGS_URL = '/nutrition-settings';
const AUTH_ME_URL = '/auth/me';
const CHANGE_PASSWORD_URL = '/auth/change-password';
const DELETE_ACCOUNT_URL = '/auth/account';

export const settingsApi = {
  getSettings(): Promise<NutritionSettings> {
    return apiClient.get<NutritionSettings>(NUTRITION_SETTINGS_URL).then((r) => r.data);
  },

  updateSettings(payload: UpdateSettingsPayload): Promise<NutritionSettings> {
    return apiClient.patch<NutritionSettings>(NUTRITION_SETTINGS_URL, payload).then((r) => r.data);
  },

  updateProfile(payload: UpdateProfilePayload): Promise<UserPublic> {
    return apiClient.patch<UserPublic>(AUTH_ME_URL, payload).then((r) => r.data);
  },

  changePassword(payload: ChangePasswordPayload): Promise<void> {
    return apiClient.patch(CHANGE_PASSWORD_URL, payload).then(() => undefined);
  },

  deleteAccount(): Promise<void> {
    return apiClient.delete(DELETE_ACCOUNT_URL).then(() => undefined);
  },
};
