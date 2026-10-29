import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { detectImageKind } from './image-signature';
import { ProgressPhotoStorage } from './progress-photo.storage';
import { ProgressRepository } from './progress.repository';
import { ProgressService } from './progress.service';

const JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 1,
]);
const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d,
]);

function setup() {
  const repo = {
    create: jest
      .fn()
      .mockImplementation((_userId: string, data: object) =>
        Promise.resolve({ id: 'e1', photos: [], ...data }),
      ),
    update: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(null),
    findOwned: jest.fn().mockResolvedValue(null),
    findOwnedPhoto: jest.fn().mockResolvedValue(null),
    addPhoto: jest.fn().mockResolvedValue({ id: 'p1' }),
    replacePhoto: jest.fn(),
    deletePhoto: jest.fn().mockResolvedValue(null),
  };
  const storage = {
    createKey: jest.fn().mockReturnValue('u1/new.jpg'),
    save: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    open: jest.fn(),
    removeUser: jest.fn(),
  };
  const service = new ProgressService(
    repo as unknown as ProgressRepository,
    storage as unknown as ProgressPhotoStorage,
  );
  return { service, repo, storage };
}

describe('detectImageKind', () => {
  it('recognises images by their content, not their name', () => {
    expect(detectImageKind(JPEG)?.mimeType).toBe('image/jpeg');
    expect(detectImageKind(PNG)?.mimeType).toBe('image/png');
    expect(
      detectImageKind(Buffer.from('RIFF\0\0\0\0WEBPVP8 ', 'ascii'))?.mimeType,
    ).toBe('image/webp');
    expect(
      detectImageKind(Buffer.from('\0\0\0\x18ftypheic\0\0', 'binary'))
        ?.mimeType,
    ).toBe('image/heic');
    expect(detectImageKind(Buffer.from('<svg xmlns="x"></svg>'))).toBeNull();
    expect(detectImageKind(Buffer.from('%PDF-1.7 something'))).toBeNull();
  });
});

describe('ProgressService', () => {
  it('rounds values, trims notes and keeps omitted metrics empty', async () => {
    const { service, repo } = setup();
    await service.create('u1', {
      date: '2026-10-01',
      weightKg: 72.46,
      waistCm: 80.04,
      note: '  after holiday  ',
    });
    expect(repo.create).toHaveBeenCalledWith('u1', {
      date: '2026-10-01',
      weightKg: 72.5,
      waistCm: 80,
      note: 'after holiday',
    });
  });

  it('refuses entries dated in the future', async () => {
    const { service, repo } = setup();
    await expect(
      service.create('u1', { date: '2099-01-01', weightKg: 70 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('clears a measurement when it is sent as null', async () => {
    const { service, repo } = setup();
    repo.update.mockResolvedValue({ id: 'e1' });
    await service.update('u1', 'e1', { waistCm: null, note: '' });
    expect(repo.update).toHaveBeenCalledWith('u1', 'e1', {
      waistCm: null,
      note: null,
    });
  });

  it('answers 404 for entries and photos of other users', async () => {
    const { service } = setup();
    await expect(service.get('u2', 'e1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.update('u2', 'e1', { weightKg: 70 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove('u2', 'e1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.openPhoto('u2', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.deletePhoto('u2', 'p1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects files that are not images before storing them', async () => {
    const { service, repo, storage } = setup();
    repo.findOwned.mockResolvedValue({ id: 'e1', photos: [] });
    const fake = Buffer.from('<html><script>alert(1)</script></html>');
    await expect(
      service.addPhoto('u1', 'e1', { buffer: fake, size: fake.length }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.addPhoto('u1', 'e1', undefined),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('limits the number of photos per entry', async () => {
    const { service, repo, storage } = setup();
    repo.findOwned.mockResolvedValue({
      id: 'e1',
      photos: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
    });
    await expect(
      service.addPhoto('u1', 'e1', { buffer: JPEG, size: JPEG.length }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(storage.save).not.toHaveBeenCalled();
  });

  it('stores a valid photo under the owner and records its detected type', async () => {
    const { service, repo, storage } = setup();
    repo.findOwned.mockResolvedValue({ id: 'e1', photos: [] });
    await service.addPhoto('u1', 'e1', { buffer: PNG, size: PNG.length });
    expect(storage.createKey).toHaveBeenCalledWith('u1', 'png');
    expect(repo.addPhoto).toHaveBeenCalledWith(
      expect.objectContaining({
        entryId: 'e1',
        userId: 'u1',
        mimeType: 'image/png',
      }),
    );
  });

  it('removes the stored file when the database write fails', async () => {
    const { service, repo, storage } = setup();
    repo.findOwned.mockResolvedValue({ id: 'e1', photos: [] });
    repo.addPhoto.mockRejectedValue(new Error('db down'));
    await expect(
      service.addPhoto('u1', 'e1', { buffer: JPEG, size: JPEG.length }),
    ).rejects.toThrow('db down');
    expect(storage.remove).toHaveBeenCalledWith(['u1/new.jpg']);
  });

  it('replaces a photo and deletes the old file only after the swap', async () => {
    const { service, repo, storage } = setup();
    repo.findOwnedPhoto.mockResolvedValue({
      id: 'p1',
      storageKey: 'u1/old.jpg',
    });
    repo.replacePhoto.mockResolvedValue('u1/old.jpg');
    await service.replacePhoto('u1', 'p1', { buffer: JPEG, size: JPEG.length });
    expect(storage.save).toHaveBeenCalledWith('u1/new.jpg', JPEG);
    expect(storage.remove).toHaveBeenCalledWith(['u1/old.jpg']);
  });

  it('deletes photo files together with their entry', async () => {
    const { service, repo, storage } = setup();
    repo.delete.mockResolvedValue(['u1/a.jpg', 'u1/b.jpg']);
    await service.remove('u1', 'e1');
    expect(storage.remove).toHaveBeenCalledWith(['u1/a.jpg', 'u1/b.jpg']);
  });
});
