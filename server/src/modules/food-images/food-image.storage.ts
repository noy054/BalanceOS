import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createReadStream, ReadStream } from 'fs';
import { access, mkdir, rm, stat, writeFile } from 'fs/promises';
import * as path from 'path';

const FILE_PATTERN = /^[A-Za-z0-9-]+\.(jpg|png|webp|heic)$/;
const USER_PATTERN = /^[A-Za-z0-9_-]+$/;

@Injectable()
export class FoodImageStorage {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = path.resolve(
      config.get<string>('FOOD_IMAGE_DIR') ??
        path.join(process.cwd(), 'storage', 'food-images'),
    );
  }

  createFileName(extension: string): string {
    return `${randomUUID()}.${extension}`;
  }

  async save(userId: string, fileName: string, data: Buffer): Promise<void> {
    const file = this.resolve(userId, fileName);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data, { flag: 'wx', mode: 0o600 });
  }

  async exists(userId: string, fileName: string): Promise<boolean> {
    try {
      await access(this.resolve(userId, fileName));
      return true;
    } catch {
      return false;
    }
  }

  async open(
    userId: string,
    fileName: string,
  ): Promise<{ stream: ReadStream; size: number }> {
    const file = this.resolve(userId, fileName);
    const info = await stat(file);
    return { stream: createReadStream(file), size: info.size };
  }

  async removeUser(userId: string): Promise<void> {
    if (!USER_PATTERN.test(userId)) return;
    await rm(path.join(this.root, userId), { recursive: true, force: true });
  }

  private resolve(userId: string, fileName: string): string {
    if (!USER_PATTERN.test(userId) || !FILE_PATTERN.test(fileName)) {
      throw new Error('Invalid image key');
    }
    const file = path.resolve(this.root, userId, fileName);
    if (!file.startsWith(this.root + path.sep)) {
      throw new Error('Invalid image key');
    }
    return file;
  }
}
