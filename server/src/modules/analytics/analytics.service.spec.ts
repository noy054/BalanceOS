import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPublic } from '../users/types/user.types';
import { AnalyticsRepository } from './analytics.repository';
import { AnalyticsService } from './analytics.service';

function user(overrides: Partial<UserPublic> = {}): UserPublic {
  return {
    id: 'u1',
    email: 'noa@gmail.com',
    fullName: 'Noa',
    provider: 'local',
    googleId: null,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as UserPublic;
}

function setup(extraExcluded = '') {
  const repo = {
    record: jest.fn().mockImplementation((events: unknown[]) => events.length),
    featureDays: jest.fn().mockResolvedValue([]),
    features: jest.fn().mockResolvedValue([]),
    actions: jest.fn().mockResolvedValue([]),
    activeDays: jest.fn().mockResolvedValue([]),
    totals: jest.fn().mockResolvedValue({ users: 0, events: 0, failed: 0 }),
    lastEventAt: jest.fn().mockResolvedValue(null),
  };
  const config = { get: jest.fn().mockReturnValue(extraExcluded) };
  const service = new AnalyticsService(
    repo as unknown as AnalyticsRepository,
    config as unknown as ConfigService,
  );
  return { service, repo };
}

const event = (overrides: Record<string, string> = {}) => ({
  id: 'evt-12345678',
  action: 'meal_item_added',
  status: 'completed',
  occurredAt: new Date().toISOString(),
  ...overrides,
});

describe('AnalyticsService', () => {
  it('stores whitelisted events with their feature', async () => {
    const { service, repo } = setup();
    await service.record(user(), { events: [event()] });
    expect(repo.record).toHaveBeenCalledWith([
      expect.objectContaining({
        userId: 'u1',
        clientEventId: 'evt-12345678',
        feature: 'food_logging',
        action: 'meal_item_added',
        status: 'completed',
      }),
    ]);
  });

  it('ignores admins and test accounts', async () => {
    const { service, repo } = setup('qa@balanceos.app');
    await service.record(user({ role: 'ADMIN' }), { events: [event()] });
    await service.record(user({ email: 'someone@example.com' }), {
      events: [event()],
    });
    await service.record(user({ email: 'noa+test@gmail.com' }), {
      events: [event()],
    });
    await service.record(user({ email: 'QA@balanceos.app' }), {
      events: [event()],
    });
    expect(repo.record).not.toHaveBeenCalled();
  });

  it('drops stale events and clamps future timestamps', async () => {
    const { service, repo } = setup();
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await service.record(user(), {
      events: [
        event({ occurredAt: old }),
        event({ id: 'evt-future01', occurredAt: future }),
      ],
    });
    const stored = repo.record.mock.calls[0][0] as { occurredAt: Date }[];
    expect(stored).toHaveLength(1);
    expect(stored[0].occurredAt.getTime()).toBeLessThan(
      Date.now() + 10 * 60 * 1000,
    );
  });

  it('rejects an inverted or oversized dashboard range', async () => {
    const { service } = setup();
    await expect(
      service.dashboard({ from: '2026-10-10', to: '2026-10-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.dashboard({ from: '2024-01-01', to: '2026-10-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('fills every day and every feature in the dashboard', async () => {
    const { service, repo } = setup();
    repo.features.mockResolvedValueOnce([
      { feature: 'barcode', events: 4, users: 2, failed: 1 },
    ]);
    repo.featureDays.mockResolvedValue([
      {
        date: '2026-10-02',
        feature: 'barcode',
        events: 4,
        users: 2,
        failed: 1,
      },
    ]);
    const result = await service.dashboard({
      from: '2026-10-01',
      to: '2026-10-03',
    });
    expect(result.days).toEqual(['2026-10-01', '2026-10-02', '2026-10-03']);
    const barcode = result.features.find(
      (entry) => entry.feature === 'barcode',
    );
    expect(barcode).toMatchObject({
      events: 4,
      uniqueUsers: 2,
      failed: 1,
      completionRate: 75,
      daily: [0, 4, 0],
    });
    expect(result.features).toHaveLength(9);
  });
});
