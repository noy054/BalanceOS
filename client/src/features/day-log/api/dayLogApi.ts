import { apiClient } from '../../../shared/api/client';
import { DAY_LOG_ENDPOINTS } from '../constants';
import {
  AddMealItemPayload,
  CopyToDaysPayload,
  DayLogCalendarResponse,
  DayLogMealsResponse,
  DayLogResponse,
  MealItemComponent,
  UpdateMealItemComponentPayload,
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

  getMealItemComponents(itemId: string): Promise<{ components: MealItemComponent[] }> {
    return apiClient
      .get<{ components: MealItemComponent[] }>(DAY_LOG_ENDPOINTS.ITEM_COMPONENTS(itemId))
      .then((r) => r.data);
  },

  updateMealItemComponent({
    itemId,
    componentId,
    ...amount
  }: UpdateMealItemComponentPayload): Promise<{ id: string }> {
    return apiClient
      .patch<{ id: string }>(DAY_LOG_ENDPOINTS.ITEM_COMPONENT(itemId, componentId), amount)
      .then((r) => r.data);
  },

  moveMealItem(itemId: string, mealType: string): Promise<{ id: string; mealEntryId: string }> {
    return apiClient
      .post<{ id: string; mealEntryId: string }>(DAY_LOG_ENDPOINTS.MOVE_MEAL_ITEM(itemId), { mealType })
      .then((r) => r.data);
  },

  removeMealItem(itemId: string): Promise<void> {
    return apiClient
      .delete(DAY_LOG_ENDPOINTS.REMOVE_MEAL_ITEM(itemId))
      .then(() => undefined);
  },

  copyToDays({ target, targetDates, today }: CopyToDaysPayload): Promise<void> {
    const endpoint =
      target.kind === "meal"
        ? DAY_LOG_ENDPOINTS.COPY_MEAL_ENTRY(target.id)
        : DAY_LOG_ENDPOINTS.COPY_MEAL_ITEM(target.id);
    return apiClient.post(endpoint, { targetDates, ...(today ? { today } : {}) }).then(() => undefined);
  },
};
