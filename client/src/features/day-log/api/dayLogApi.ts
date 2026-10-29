import { apiClient } from '../../../shared/api/client';
import { DAY_LOG_ENDPOINTS } from '../constants';
import {
  AddMealItemPayload,
  CopyToDaysPayload,
  DayLogCalendarResponse,
  DayLogMealsResponse,
  DayLogResponse,
  UpdateMealItemPayload,
} from '../types';

export const dayLogApi = {
  getDay(date: string): Promise<DayLogResponse> {
    return apiClient.get<DayLogResponse>(DAY_LOG_ENDPOINTS.DAY(date)).then((r) => r.data);
  },

  getDayMeals(date: string): Promise<DayLogMealsResponse> {
    return apiClient.get<DayLogMealsResponse>(DAY_LOG_ENDPOINTS.DAY_MEALS(date)).then((r) => r.data);
  },

  getCalendar(from: string, to: string): Promise<DayLogCalendarResponse> {
    return apiClient
      .get<DayLogCalendarResponse>(DAY_LOG_ENDPOINTS.CALENDAR, { params: { from, to } })
      .then((r) => r.data);
  },

  addMealItem(date: string, payload: AddMealItemPayload): Promise<{ id: string }> {
    return apiClient
      .post<{ id: string }>(DAY_LOG_ENDPOINTS.ADD_MEAL_ITEM(date), payload)
      .then((r) => r.data);
  },

  updateMealItem({ itemId, ...amount }: UpdateMealItemPayload): Promise<{ id: string }> {
    return apiClient
      .patch<{ id: string }>(DAY_LOG_ENDPOINTS.REMOVE_MEAL_ITEM(itemId), amount)
      .then((r) => r.data);
  },

  removeMealItem(itemId: string): Promise<void> {
    return apiClient
      .delete(DAY_LOG_ENDPOINTS.REMOVE_MEAL_ITEM(itemId))
      .then(() => undefined);
  },

  copyToDays({ target, targetDates }: CopyToDaysPayload): Promise<void> {
    const endpoint =
      target.kind === "meal"
        ? DAY_LOG_ENDPOINTS.COPY_MEAL_ENTRY(target.id)
        : DAY_LOG_ENDPOINTS.COPY_MEAL_ITEM(target.id);
    return apiClient.post(endpoint, { targetDates }).then(() => undefined);
  },
};
