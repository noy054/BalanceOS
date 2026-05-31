import { apiClient } from '../../../shared/api/client';
import { RECIPE_ENDPOINTS } from '../constants';
import { CreateRecipePayload, PantryRecipe, UpdateRecipePayload } from '../types';

export const recipesApi = {
  list(): Promise<PantryRecipe[]> {
    return apiClient.get<PantryRecipe[]>(RECIPE_ENDPOINTS.BASE).then((r) => r.data);
  },

  getById(id: string): Promise<PantryRecipe> {
    return apiClient.get<PantryRecipe>(RECIPE_ENDPOINTS.BY_ID(id)).then((r) => r.data);
  },

  create(payload: CreateRecipePayload): Promise<PantryRecipe> {
    return apiClient.post<PantryRecipe>(RECIPE_ENDPOINTS.BASE, payload).then((r) => r.data);
  },

  update(id: string, payload: UpdateRecipePayload): Promise<PantryRecipe> {
    return apiClient.patch<PantryRecipe>(RECIPE_ENDPOINTS.BY_ID(id), payload).then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(RECIPE_ENDPOINTS.BY_ID(id)).then(() => undefined);
  },
};
