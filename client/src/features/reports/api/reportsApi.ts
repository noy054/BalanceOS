import { apiClient } from "../../../shared/api/client";
import { DateKey } from "../../../shared/helpers/dateKey";
import { NutritionReport } from "../types";

export const reportsApi = {
  nutrition(from: DateKey, to: DateKey): Promise<NutritionReport> {
    return apiClient
      .get<NutritionReport>("/statistics/report", { params: { from, to } })
      .then((response) => response.data);
  },
};
