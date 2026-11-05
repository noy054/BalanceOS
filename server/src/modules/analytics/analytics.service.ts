import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserPublic } from '../users/types/user.types';
import {
  ANALYTICS_ACTIONS,
  ANALYTICS_FEATURES,
  DEFAULT_EXCLUDED_EMAIL_PATTERNS,
  MAX_DASHBOARD_DAYS,
  MAX_EVENT_AGE_DAYS,
} from './analytics.constants';
import { AnalyticsRange, AnalyticsRepository } from './analytics.repository';
import {
  AnalyticsDashboardQueryDto,
  TrackEventsDto,
} from './dto/analytics.dto';

const DAY_MS = 24 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

function dayStart(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function rate(completed: number, total: number): number | null {
  return total > 0 ? Math.round((completed / total) * 1000) / 10 : null;
}

function change(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function likeToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .toLowerCase()
    .split('%')
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${escaped}$`);
}

@Injectable()
export class AnalyticsService {
  private readonly excludedEmails: string[];
  private readonly excludedMatchers: RegExp[];

  constructor(
    private readonly repo: AnalyticsRepository,
    config: ConfigService,
  ) {
    const extra = (config.get<string>('ANALYTICS_EXCLUDED_EMAILS') ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean);
    this.excludedEmails = [...DEFAULT_EXCLUDED_EMAIL_PATTERNS, ...extra];
    this.excludedMatchers = this.excludedEmails.map(likeToRegExp);
  }

  isExcluded(user: Pick<UserPublic, 'role' | 'email'>): boolean {
    if (user.role === 'ADMIN') return true;
    const email = user.email.toLowerCase();
    return this.excludedMatchers.some((matcher) => matcher.test(email));
  }

  async record(user: UserPublic, dto: TrackEventsDto) {
    if (this.isExcluded(user)) return { accepted: 0 };
    const now = Date.now();
    const oldest = now - MAX_EVENT_AGE_DAYS * DAY_MS;
    const events = dto.events.flatMap((event) => {
      const feature = ANALYTICS_ACTIONS[event.action];
      const time = new Date(event.occurredAt).getTime();
      if (!feature || Number.isNaN(time) || time < oldest) return [];
      return [
        {
          userId: user.id,
          clientEventId: event.id,
          feature,
          action: event.action,
          status: event.status,
          occurredAt: new Date(Math.min(time, now + FUTURE_TOLERANCE_MS)),
        },
      ];
    });
    const accepted = await this.repo.record(events);
    return { accepted };
  }

  async dashboard(query: AnalyticsDashboardQueryDto) {
    const from = dayStart(query.from);
    const toInclusive = dayStart(query.to);
    if (Number.isNaN(from.getTime()) || Number.isNaN(toInclusive.getTime())) {
      throw new BadRequestException('Invalid date range');
    }
    const dayCount =
      Math.round((toInclusive.getTime() - from.getTime()) / DAY_MS) + 1;
    if (dayCount < 1 || dayCount > MAX_DASHBOARD_DAYS) {
      throw new BadRequestException('Invalid date range');
    }

    const range: AnalyticsRange = {
      from,
      to: new Date(toInclusive.getTime() + DAY_MS),
      excludedEmails: this.excludedEmails,
    };
    const previous: AnalyticsRange = {
      from: new Date(from.getTime() - dayCount * DAY_MS),
      to: from,
      excludedEmails: this.excludedEmails,
    };

    const [
      featureDays,
      features,
      actions,
      activeDays,
      totals,
      previousTotals,
      previousFeatures,
      lastEventAt,
    ] = await Promise.all([
      this.repo.featureDays(range),
      this.repo.features(range),
      this.repo.actions(range),
      this.repo.activeDays(range),
      this.repo.totals(range),
      this.repo.totals(previous),
      this.repo.features(previous),
      this.repo.lastEventAt(range),
    ]);

    const days = Array.from({ length: dayCount }, (_, index) =>
      dayKey(new Date(from.getTime() + index * DAY_MS)),
    );
    const activeByDay = new Map(activeDays.map((row) => [row.date, row.users]));

    return {
      generatedAt: new Date().toISOString(),
      lastEventAt: lastEventAt ? lastEventAt.toISOString() : null,
      from: query.from,
      to: query.to,
      days,
      totals: {
        activeUsers: totals.users,
        events: totals.events,
        failed: totals.failed,
        completionRate: rate(totals.events - totals.failed, totals.events),
        activeUsersChange: change(totals.users, previousTotals.users),
        eventsChange: change(totals.events, previousTotals.events),
      },
      activeUsers: days.map((date) => ({
        date,
        users: activeByDay.get(date) ?? 0,
      })),
      features: ANALYTICS_FEATURES.map((feature) => {
        const row = features.find((entry) => entry.feature === feature);
        const before = previousFeatures.find(
          (entry) => entry.feature === feature,
        );
        const events = row?.events ?? 0;
        const failed = row?.failed ?? 0;
        const byDay = new Map(
          featureDays
            .filter((entry) => entry.feature === feature)
            .map((entry) => [entry.date, entry.events]),
        );
        return {
          feature,
          events,
          uniqueUsers: row?.users ?? 0,
          failed,
          completionRate: rate(events - failed, events),
          previousEvents: before?.events ?? 0,
          change: change(events, before?.events ?? 0),
          daily: days.map((date) => byDay.get(date) ?? 0),
        };
      }).sort((a, b) => b.events - a.events),
      actions: actions.map((row) => ({
        action: row.action,
        feature: row.feature,
        events: row.events,
        uniqueUsers: row.users,
        failed: row.failed,
        completionRate: rate(row.events - row.failed, row.events),
      })),
    };
  }
}
