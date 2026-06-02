import { apiClient } from '../../../shared/api/client';
import { DAY_LOG_ENDPOINTS } from '../constants';
import { AddMealItemPayload, DayLogResponse } from '../types';

export const dayLogApi = {
  getToday(): Promise<DayLogResponse> {
    return apiClient.get<DayLogResponse>(DAY_LOG_ENDPOINTS.TODAY).then((r) => r.data);
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
};
