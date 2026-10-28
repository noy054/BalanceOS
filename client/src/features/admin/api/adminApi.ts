import { apiClient } from "../../../shared/api/client";
import { Page } from "../../pantry/types";
import { ADMIN_ENDPOINTS, AnnouncementActionName } from "../constants";
import {
  AdminAnnouncement,
  AdminAnnouncementDetail,
  AdminEntityType,
  AdminHistoryEntry,
  AdminOverview,
  AnnouncementPayload,
  AnnouncementState,
} from "../types";

export const adminApi = {
  overview(): Promise<AdminOverview> {
    return apiClient.get<AdminOverview>(ADMIN_ENDPOINTS.OVERVIEW).then((r) => r.data);
  },

  activity(params: { entityType?: AdminEntityType; cursor?: string }): Promise<Page<AdminHistoryEntry>> {
    return apiClient
      .get<Page<AdminHistoryEntry>>(ADMIN_ENDPOINTS.ACTIVITY, { params })
      .then((r) => r.data);
  },

  announcements(params: {
    state?: AnnouncementState;
    q?: string;
    cursor?: string;
  }): Promise<Page<AdminAnnouncement>> {
    return apiClient
      .get<Page<AdminAnnouncement>>(ADMIN_ENDPOINTS.ANNOUNCEMENTS, { params })
      .then((r) => r.data);
  },

  announcement(id: string): Promise<AdminAnnouncementDetail> {
    return apiClient
      .get<AdminAnnouncementDetail>(ADMIN_ENDPOINTS.ANNOUNCEMENT(id))
      .then((r) => r.data);
  },

  createAnnouncement(payload: AnnouncementPayload): Promise<AdminAnnouncement> {
    return apiClient
      .post<AdminAnnouncement>(ADMIN_ENDPOINTS.ANNOUNCEMENTS, payload)
      .then((r) => r.data);
  },

  updateAnnouncement(id: string, payload: AnnouncementPayload): Promise<AdminAnnouncement> {
    return apiClient
      .patch<AdminAnnouncement>(ADMIN_ENDPOINTS.ANNOUNCEMENT(id), payload)
      .then((r) => r.data);
  },

  announcementAction(
    id: string,
    action: AnnouncementActionName,
    body?: { publishAt?: string },
  ): Promise<AdminAnnouncement> {
    return apiClient
      .post<AdminAnnouncement>(ADMIN_ENDPOINTS.ANNOUNCEMENT_ACTION(id, action), body ?? {})
      .then((r) => r.data);
  },

  deleteAnnouncement(id: string): Promise<void> {
    return apiClient.delete(ADMIN_ENDPOINTS.ANNOUNCEMENT(id)).then(() => undefined);
  },
};
