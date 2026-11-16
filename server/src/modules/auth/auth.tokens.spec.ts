import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { MailerService } from './mailer.service';
import { UsersService } from '../users/users.service';
import { ProgressService } from '../progress/progress.service';
import { FoodImagesService } from '../food-images/food-images.service';

describe('AuthService token pairs', () => {
  afterEach(() => jest.useRealTimers());

  it('gives two sign-ins in the same second different refresh tokens', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-15T10:00:00Z') });
    const user = {
      id: 'u1',
      email: 'a@b.test',
      passwordHash: await bcrypt.hash('Secret-12345', 4),
    };
    const saved: string[] = [];
    const users = {
      findByEmail: jest.fn().mockResolvedValue(user),
      findById: jest.fn().mockResolvedValue(user),
      toPublic: jest.fn().mockReturnValue({ id: 'u1' }),
    };
    const repo = {
      deleteExpiredTokens: jest.fn().mockResolvedValue(undefined),
      saveRefreshToken: jest.fn((_id: string, token: string) => {
        saved.push(token);
        return Promise.resolve();
      }),
    };
    const config = {
      getOrThrow: (key: string) => `${key}-secret`,
      get: () => undefined,
    };
    const service = new AuthService(
      users as unknown as UsersService,
      repo as unknown as AuthRepository,
      {} as MailerService,
      new JwtService(),
      config as unknown as ConfigService,
      {} as ProgressService,
      {} as FoodImagesService,
    );

    const first = await service.login({
      email: 'a@b.test',
      password: 'Secret-12345',
    });
    const second = await service.login({
      email: 'a@b.test',
      password: 'Secret-12345',
    });

    expect(first.refreshToken).not.toBe(second.refreshToken);
    expect(new Set(saved).size).toBe(2);
  });

  it('removes the account and then every stored photo of the user', async () => {
    const order: string[] = [];
    const users = {
      deleteById: jest.fn(() => {
        order.push('account');
        return Promise.resolve();
      }),
    };
    const progress = {
      removeUserFiles: jest.fn(() => {
        order.push('progress photos');
        return Promise.resolve();
      }),
    };
    const images = {
      removeUserFiles: jest.fn(() => {
        order.push('food images');
        return Promise.reject(new Error('disk busy'));
      }),
    };
    const service = new AuthService(
      users as unknown as UsersService,
      {} as AuthRepository,
      {} as MailerService,
      new JwtService(),
      {} as ConfigService,
      progress as unknown as ProgressService,
      images as unknown as FoodImagesService,
    );
    await expect(service.deleteAccount('u1')).resolves.toBeUndefined();
    expect(order).toEqual(['account', 'progress photos', 'food images']);
  });
});
