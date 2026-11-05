import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { detectImageKind } from '../progress/image-signature';
import { FoodImageStorage } from './food-image.storage';
import {
  FOOD_IMAGE_MIME,
  FOOD_IMAGE_PREFIX,
  MAX_FOOD_IMAGE_BYTES,
} from './food-images.constants';

export type UploadedFoodImage = {
  buffer: Buffer;
  size: number;
};

const REMOTE_URL = /^https?:\/\//i;
const SECURE_URL = /^https:\/\//i;
const MAX_REMOTE_URL_LENGTH = 2048;

@Injectable()
export class FoodImagesService {
  constructor(private readonly storage: FoodImageStorage) {}

  async upload(userId: string, file: UploadedFoodImage | undefined) {
    if (!file || file.size === 0) {
      throw new BadRequestException('Choose an image to upload');
    }
    if (file.size > MAX_FOOD_IMAGE_BYTES) {
      throw new BadRequestException('The image is too large');
    }
    const kind = detectImageKind(file.buffer);
    if (!kind) {
      throw new BadRequestException(
        'Images must be JPEG, PNG, WebP or HEIC files',
      );
    }
    const fileName = this.storage.createFileName(kind.extension);
    await this.storage.save(userId, fileName, file.buffer);
    return { imageUrl: `${FOOD_IMAGE_PREFIX}${fileName}` };
  }

  async open(userId: string, fileName: string) {
    try {
      const { stream, size } = await this.storage.open(userId, fileName);
      const extension = fileName.split('.').pop() ?? '';
      return {
        stream,
        size,
        mimeType: FOOD_IMAGE_MIME[extension] ?? 'application/octet-stream',
      };
    } catch {
      throw new NotFoundException('Image not found');
    }
  }

  async assertUsable(
    userId: string,
    imageUrl: string | null | undefined,
  ): Promise<void> {
    if (imageUrl == null || imageUrl === '') return;
    if (REMOTE_URL.test(imageUrl)) {
      if (!SECURE_URL.test(imageUrl)) {
        throw new BadRequestException('Image links must use https');
      }
      if (imageUrl.length > MAX_REMOTE_URL_LENGTH) {
        throw new BadRequestException('The image link is too long');
      }
      return;
    }
    if (imageUrl.startsWith(FOOD_IMAGE_PREFIX)) {
      const fileName = imageUrl.slice(FOOD_IMAGE_PREFIX.length);
      const exists = await this.storage
        .exists(userId, fileName)
        .catch(() => false);
      if (exists) return;
    }
    throw new BadRequestException('Upload the image before saving');
  }

  removeUserFiles(userId: string): Promise<void> {
    return this.storage.removeUser(userId);
  }
}
