import { apiClient } from '../../../shared/api/client';
import { SAVED_MEAL_ENDPOINTS } from '../constants';
import { CreateSavedMealPayload, SavedMeal, UpdateSavedMealPayload } from '../types';

export const savedMealsApi = {
  list(): Promise<SavedMeal[]> {
    return apiClient.get<SavedMeal[]>(SAVED_MEAL_ENDPOINTS.BASE).then((r) => r.data);
  },

  getById(id: string): Promise<SavedMeal> {
    return apiClient.get<SavedMeal>(SAVED_MEAL_ENDPOINTS.BY_ID(id)).then((r) => r.data);
  },

  create(payload: CreateSavedMealPayload): Promise<SavedMeal> {
    return apiClient.post<SavedMeal>(SAVED_MEAL_ENDPOINTS.BASE, payload).then((r) => r.data);
  },

  update(id: string, payload: UpdateSavedMealPayload): Promise<SavedMeal> {
    return apiClient.patch<SavedMeal>(SAVED_MEAL_ENDPOINTS.BY_ID(id), payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(SAVED_MEAL_ENDPOINTS.BY_ID(id)).then(() => undefined);
  },
};
