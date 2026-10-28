import { apiClient } from "../../../shared/api/client";
import { ANNOUNCEMENT_ENDPOINTS } from "../constants";
import { ActiveAnnouncement } from "../types";

export const announcementsApi = {
  active(params: { platform: string; appVersion?: string }): Promise<ActiveAnnouncement[]> {
    return apiClient
      .get<ActiveAnnouncement[]>(ANNOUNCEMENT_ENDPOINTS.ACTIVE, { params })
      .then((r) => r.data);
  },

  seen(id: string): Promise<void> {
    return apiClient.post(ANNOUNCEMENT_ENDPOINTS.SEEN(id)).then(() => undefined);
  },

  dismiss(id: string): Promise<void> {
    return apiClient.post(ANNOUNCEMENT_ENDPOINTS.DISMISS(id)).then(() => undefined);
  },
};
