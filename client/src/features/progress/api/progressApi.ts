import { apiClient } from "../../../shared/api/client";
import { imageForm, readAsDataUrl, UPLOAD_HEADERS } from "../../../shared/api/imageUpload";
import { PROGRESS_ENDPOINTS } from "../constants";
import { BodyEntry, BodyEntryPage, BodyEntryPayload, ProgressOverview, ProgressPhotoRef } from "../types";

function photoForm(uri: string): Promise<FormData> {
  return imageForm("photo", uri, "progress-photo");
}

export const progressApi = {
  overview(params: { from?: string; to: string }): Promise<ProgressOverview> {
    return apiClient.get<ProgressOverview>(PROGRESS_ENDPOINTS.OVERVIEW, { params }).then((r) => r.data);
  },

  entries(params: { from?: string; to?: string; cursor?: string; limit?: number }): Promise<BodyEntryPage> {
    return apiClient.get<BodyEntryPage>(PROGRESS_ENDPOINTS.ENTRIES, { params }).then((r) => r.data);
  },

  entry(id: string): Promise<BodyEntry> {
    return apiClient.get<BodyEntry>(PROGRESS_ENDPOINTS.ENTRY(id)).then((r) => r.data);
  },

  create(payload: BodyEntryPayload & { date: string }): Promise<BodyEntry> {
    return apiClient.post<BodyEntry>(PROGRESS_ENDPOINTS.ENTRIES, payload).then((r) => r.data);
  },

  update(id: string, payload: BodyEntryPayload): Promise<BodyEntry> {
    return apiClient.patch<BodyEntry>(PROGRESS_ENDPOINTS.ENTRY(id), payload).then((r) => r.data);
  },

  remove(id: string): Promise<void> {
    return apiClient.delete(PROGRESS_ENDPOINTS.ENTRY(id)).then(() => undefined);
  },

  async addPhoto(entryId: string, uri: string): Promise<ProgressPhotoRef> {
    const form = await photoForm(uri);
    return apiClient
      .post<ProgressPhotoRef>(PROGRESS_ENDPOINTS.ENTRY_PHOTOS(entryId), form, { headers: UPLOAD_HEADERS })
      .then((r) => r.data);
  },

  async replacePhoto(photoId: string, uri: string): Promise<void> {
    const form = await photoForm(uri);
    await apiClient.put(PROGRESS_ENDPOINTS.PHOTO(photoId), form, { headers: UPLOAD_HEADERS });
  },

  removePhoto(photoId: string): Promise<void> {
    return apiClient.delete(PROGRESS_ENDPOINTS.PHOTO(photoId)).then(() => undefined);
  },

  async photoDataUrl(photoId: string): Promise<string> {
    const response = await apiClient.get<Blob>(PROGRESS_ENDPOINTS.PHOTO(photoId), { responseType: "blob" });
    return readAsDataUrl(response.data);
  },
};
