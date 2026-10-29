import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { createReadStream, ReadStream } from 'fs';
import { mkdir, rm, stat, writeFile } from 'fs/promises';
import * as path from 'path';

const KEY_PATTERN = /^[A-Za-z0-9_-]+\/[A-Za-z0-9-]+\.(jpg|png|webp|heic)$/;
const USER_PATTERN = /^[A-Za-z0-9_-]+$/;

@Injectable()
export class ProgressPhotoStorage {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = path.resolve(
      config.get<string>('PROGRESS_PHOTO_DIR') ??
        path.join(process.cwd(), 'storage', 'progress-photos'),
    );
  }

  createKey(userId: string, extension: string): string {
    return `${userId}/${randomUUID()}.${extension}`;
  }

  async save(key: string, data: Buffer): Promise<void> {
    const file = this.resolve(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data, { flag: 'wx', mode: 0o600 });
  }

  async open(key: string): Promise<{ stream: ReadStream; size: number }> {
    const file = this.resolve(key);
    const info = await stat(file);
    return { stream: createReadStream(file), size: info.size };
  }

  async remove(keys: string[]): Promise<void> {
    await Promise.all(
      keys.map((key) => rm(this.resolve(key), { force: true })),
    );
  }

  async removeUser(userId: string): Promise<void> {
    if (!USER_PATTERN.test(userId)) return;
    await rm(path.join(this.root, userId), { recursive: true, force: true });
  }

  private resolve(key: string): string {
    if (!KEY_PATTERN.test(key)) throw new Error('Invalid photo key');
    const file = path.resolve(this.root, key);
    if (!file.startsWith(this.root + path.sep)) {
      throw new Error('Invalid photo key');
    }
    return file;
  }
}
