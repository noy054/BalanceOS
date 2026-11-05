import { apiClient } from "../../../shared/api/client";
import { imageForm, readAsDataUrl, UPLOAD_HEADERS } from "../../../shared/api/imageUpload";
import { FOOD_IMAGE_ENDPOINTS } from "../constants";

export const foodImagesApi = {
  async upload(uri: string): Promise<string> {
    const form = await imageForm("image", uri, "food-image");
    const response = await apiClient.post<{ imageUrl: string }>(FOOD_IMAGE_ENDPOINTS.UPLOAD, form, {
      headers: UPLOAD_HEADERS,
    });
    return response.data.imageUrl;
  },

  async dataUrl(file: string): Promise<string> {
    const response = await apiClient.get<Blob>(FOOD_IMAGE_ENDPOINTS.FILE(file), { responseType: "blob" });
    return readAsDataUrl(response.data);
  },
};
