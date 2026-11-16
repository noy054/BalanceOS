import { Prisma } from '../../../generated/prisma/client';
import { DayLogsRepository } from './day-logs.repository';
import { PrismaService } from '../../prisma/prisma.service';

const conflict = () =>
  new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: 'test',
  });

function setup() {
  const calls: string[] = [];
  const lazy = (label: string) => ({
    then: (resolve: (value: unknown) => void) => {
      calls.push(label);
      resolve(label);
    },
  });
  const prisma = {
    dayLog: {
      upsert: jest.fn(),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'log1' }),
    },
    mealEntry: {
      upsert: jest.fn(),
      findUniqueOrThrow: jest.fn().mockResolvedValue({ id: 'entry1' }),
    },
    mealItem: {
      create: jest.fn(() => lazy('insert')),
      delete: jest.fn(() => lazy('delete')),
    },
    $queryRaw: jest.fn((strings: TemplateStringsArray) =>
      lazy(strings.join('?').includes('FOR UPDATE') ? 'lock' : 'query'),
    ),
    $executeRaw: jest.fn(() => lazy('update')),
    $transaction: jest.fn(async (queries: PromiseLike<unknown>[]) => {
      calls.push('begin');
      const results: unknown[] = [];
      for (const query of queries) results.push(await query);
      calls.push('commit');
      return results;
    }),
  };
  return {
    repo: new DayLogsRepository(prisma as unknown as PrismaService),
    prisma,
    calls,
  };
}

describe('DayLogsRepository concurrency', () => {
  it('returns the row another request created when both try to create the same day', async () => {
    const { repo, prisma } = setup();
    prisma.dayLog.upsert.mockRejectedValue(conflict());
    await expect(
      repo.findOrCreateToday('u1', '2026-11-14', {}),
    ).resolves.toEqual({
      id: 'log1',
    });
    expect(prisma.dayLog.findUniqueOrThrow).toHaveBeenCalledWith({
      where: { userId_date: { userId: 'u1', date: '2026-11-14' } },
    });

    prisma.mealEntry.upsert.mockRejectedValue(conflict());
    await expect(repo.findOrCreateMealEntry('log1', 'LUNCH')).resolves.toEqual({
      id: 'entry1',
    });
  });

  it('does not hide other database errors', async () => {
    const { repo, prisma } = setup();
    prisma.dayLog.upsert.mockRejectedValue(new Error('connection lost'));
    await expect(
      repo.findOrCreateToday('u1', '2026-11-14', {}),
    ).rejects.toThrow('connection lost');
    expect(prisma.dayLog.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it('locks the day rows before summing totals, inside one transaction', async () => {
    const { repo, calls } = setup();
    await repo.recalculateTotalsForDayLogs(['b', 'a', 'b']);
    expect(calls).toEqual(['begin', 'lock', 'update', 'commit']);
  });

  it('commits a new or removed item together with the day totals', async () => {
    const { repo, calls } = setup();
    await repo.createMealItem(
      'entry',
      {
        macrosSnapshot: {
          name: 'Egg',
          calories: 70,
          protein: 6,
          carbs: 0,
          fat: 5,
          fiber: 0,
        },
      },
      'log1',
    );
    await repo.deleteMealItem('item1', 'log1');
    expect(calls).toEqual([
      'begin',
      'insert',
      'lock',
      'update',
      'commit',
      'begin',
      'delete',
      'lock',
      'update',
      'commit',
    ]);
  });
});
