import { apiClient } from '../../../shared/api/client';
import { DAY_LOG_ENDPOINTS } from '../constants';
import { AddMealItemPayload, CopyMealPayload, DayLogMealsResponse, DayLogResponse } from '../types';

export const dayLogApi = {
  getToday(): Promise<DayLogResponse> {
    return apiClient.get<DayLogResponse>(DAY_LOG_ENDPOINTS.TODAY).then((r) => r.data);
  },

  getTodayMeals(): Promise<DayLogMealsResponse> {
    return apiClient.get<DayLogMealsResponse>(DAY_LOG_ENDPOINTS.TODAY_MEALS).then((r) => r.data);
  },

  addMealItem(payload: AddMealItemPayload): Promise<{ id: string }> {
    return apiClient
      .post<{ id: string }>(DAY_LOG_ENDPOINTS.ADD_MEAL_ITEM, payload)
      .then((r) => r.data);
  },

  removeMealItem(itemId: string): Promise<void> {
    return apiClient
      .delete(DAY_LOG_ENDPOINTS.REMOVE_MEAL_ITEM(itemId))
      .then(() => undefined);
  },

  removeMealEntry(mealEntryId: string): Promise<void> {
    return apiClient
      .delete(DAY_LOG_ENDPOINTS.REMOVE_MEAL_ENTRY(mealEntryId))
      .then(() => undefined);
  },

  copyMealEntry(payload: CopyMealPayload): Promise<void> {
    return apiClient
      .post(DAY_LOG_ENDPOINTS.COPY_MEAL_ENTRY(payload.mealEntryId), { targetDates: payload.targetDates })
      .then(() => undefined);
  },
};
