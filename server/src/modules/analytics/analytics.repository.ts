import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type AnalyticsEventInput = {
  userId: string;
  clientEventId: string;
  feature: string;
  action: string;
  status: string;
  occurredAt: Date;
};

export type AnalyticsRange = {
  from: Date;
  to: Date;
  excludedEmails: string[];
};

type FeatureDayRow = {
  date: string;
  feature: string;
  events: number;
  users: number;
  failed: number;
};

type FeatureRow = {
  feature: string;
  events: number;
  users: number;
  failed: number;
};
type ActionRow = FeatureRow & { action: string };
type ActiveDayRow = { date: string; users: number };
type TotalRow = { users: number; events: number; failed: number };

@Injectable()
export class AnalyticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(events: AnalyticsEventInput[]): Promise<number> {
    if (events.length === 0) return 0;
    const result = await this.prisma.analyticsEvent.createMany({
      data: events,
      skipDuplicates: true,
    });
    return result.count;
  }

  private scope(range: AnalyticsRange) {
    return Prisma.sql`
      FROM "AnalyticsEvent" e
      JOIN "User" u ON u.id = e."userId"
      WHERE e."occurredAt" >= ${range.from}
        AND e."occurredAt" < ${range.to}
        AND u.role <> 'ADMIN'
        AND NOT (lower(u.email) LIKE ANY(${range.excludedEmails}::text[]))
    `;
  }

  featureDays(range: AnalyticsRange) {
    return this.prisma.$queryRaw<FeatureDayRow[]>`
      SELECT to_char(date_trunc('day', e."occurredAt"), 'YYYY-MM-DD') AS date,
             e.feature,
             count(*)::int AS events,
             count(DISTINCT e."userId")::int AS users,
             (count(*) FILTER (WHERE e.status = 'failed'))::int AS failed
      ${this.scope(range)}
      GROUP BY 1, 2
      ORDER BY 1
    `;
  }

  features(range: AnalyticsRange) {
    return this.prisma.$queryRaw<FeatureRow[]>`
      SELECT e.feature,
             count(*)::int AS events,
             count(DISTINCT e."userId")::int AS users,
             (count(*) FILTER (WHERE e.status = 'failed'))::int AS failed
      ${this.scope(range)}
      GROUP BY 1
    `;
  }

  actions(range: AnalyticsRange) {
    return this.prisma.$queryRaw<ActionRow[]>`
      SELECT e.action,
             e.feature,
             count(*)::int AS events,
             count(DISTINCT e."userId")::int AS users,
             (count(*) FILTER (WHERE e.status = 'failed'))::int AS failed
      ${this.scope(range)}
      GROUP BY 1, 2
      ORDER BY 3 DESC
    `;
  }

  activeDays(range: AnalyticsRange) {
    return this.prisma.$queryRaw<ActiveDayRow[]>`
      SELECT to_char(date_trunc('day', e."occurredAt"), 'YYYY-MM-DD') AS date,
             count(DISTINCT e."userId")::int AS users
      ${this.scope(range)}
      GROUP BY 1
      ORDER BY 1
    `;
  }

  async totals(range: AnalyticsRange): Promise<TotalRow> {
    const rows = await this.prisma.$queryRaw<TotalRow[]>`
      SELECT count(DISTINCT e."userId")::int AS users,
             count(*)::int AS events,
             (count(*) FILTER (WHERE e.status = 'failed'))::int AS failed
      ${this.scope(range)}
    `;
    return rows[0] ?? { users: 0, events: 0, failed: 0 };
  }

  async lastEventAt(range: AnalyticsRange): Promise<Date | null> {
    const rows = await this.prisma.$queryRaw<{ last: Date | null }[]>`
      SELECT max(e."createdAt") AS last
      ${this.scope(range)}
    `;
    return rows[0]?.last ?? null;
  }
}
