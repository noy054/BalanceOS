import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { AdminGuard } from '../../common/guards/admin.guard';

const row = (role: 'USER' | 'ADMIN' = 'USER') => ({
  id: 'u1',
  email: 'a@b.test',
  fullName: 'A',
  passwordHash: null,
  provider: 'local',
  googleId: null,
  role,
  createdAt: new Date(),
  updatedAt: new Date(),
});

function setup(user: ReturnType<typeof row> | null = row()) {
  const repo = {
    findById: jest.fn().mockResolvedValue(user),
    updateProfile: jest.fn().mockResolvedValue(user),
    updatePasswordHash: jest.fn().mockResolvedValue(undefined),
    deleteById: jest.fn().mockResolvedValue(undefined),
  };
  return {
    service: new UsersService(repo as unknown as UsersRepository),
    repo,
  };
}

function context(user: { id: string; role: string } | undefined) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('UsersService.getAuthUser', () => {
  afterEach(() => jest.useRealTimers());

  it('reuses a recent lookup and refreshes it after it expires', async () => {
    jest.useFakeTimers({ now: new Date('2026-11-13T10:00:00Z') });
    const { service, repo } = setup();
    await service.getAuthUser('u1');
    await service.getAuthUser('u1');
    expect(repo.findById).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date('2026-11-13T10:00:11Z'));
    await service.getAuthUser('u1');
    expect(repo.findById).toHaveBeenCalledTimes(2);
  });

  it('never caches a missing user', async () => {
    const { service, repo } = setup(null);
    expect(await service.getAuthUser('u1')).toBeNull();
    expect(await service.getAuthUser('u1')).toBeNull();
    expect(repo.findById).toHaveBeenCalledTimes(2);
  });

  it('forgets the cached user after profile changes and deletion', async () => {
    const { service, repo } = setup();
    await service.getAuthUser('u1');
    await service.updateProfile('u1', { fullName: 'B' });
    await service.getAuthUser('u1');
    expect(repo.findById).toHaveBeenCalledTimes(2);
    await service.deleteById('u1');
    repo.findById.mockResolvedValue(null);
    expect(await service.getAuthUser('u1')).toBeNull();
  });
});

describe('AdminGuard', () => {
  it('checks the current role in the database, not the cached request user', async () => {
    const { service } = setup(row('USER'));
    const guard = new AdminGuard(service);
    await expect(
      guard.canActivate(context({ id: 'u1', role: 'ADMIN' })),
    ).rejects.toBeInstanceOf(ForbiddenException);
    const admin = new AdminGuard(setup(row('ADMIN')).service);
    await expect(
      admin.canActivate(context({ id: 'u1', role: 'USER' })),
    ).resolves.toBe(true);
    await expect(admin.canActivate(context(undefined))).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
