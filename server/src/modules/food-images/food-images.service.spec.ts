import { BadRequestException } from '@nestjs/common';
import { FoodImagesService } from './food-images.service';
import { FoodImageStorage } from './food-image.storage';

function setup(exists = true) {
  const storage = {
    exists: jest.fn().mockResolvedValue(exists),
    createFileName: jest.fn().mockReturnValue('abc.jpg'),
    save: jest.fn(),
  };
  const service = new FoodImagesService(storage as unknown as FoodImageStorage);
  return { service, storage };
}

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);

describe('FoodImagesService', () => {
  it('accepts web links, uploaded images and empty values', async () => {
    const { service, storage } = setup();
    await expect(service.assertUsable('u1', null)).resolves.toBeUndefined();
    await expect(
      service.assertUsable('u1', 'https://images.example/a.jpg'),
    ).resolves.toBeUndefined();
    await expect(
      service.assertUsable('u1', 'food-image:abc.jpg'),
    ).resolves.toBeUndefined();
    expect(storage.exists).toHaveBeenCalledWith('u1', 'abc.jpg');
  });

  it('rejects device file paths and images owned by someone else', async () => {
    await expect(
      setup().service.assertUsable('u1', 'file:///data/cache/abc.jpg'),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      setup(false).service.assertUsable('u1', 'food-image:abc.jpg'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('stores uploads under the user and returns a reference', async () => {
    const { service, storage } = setup();
    await expect(
      service.upload('u1', { buffer: JPEG, size: JPEG.length }),
    ).resolves.toEqual({ imageUrl: 'food-image:abc.jpg' });
    expect(storage.save).toHaveBeenCalledWith('u1', 'abc.jpg', JPEG);
  });

  it('refuses files that are not images', async () => {
    const text = Buffer.from('not an image at all');
    await expect(
      setup().service.upload('u1', { buffer: text, size: text.length }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
