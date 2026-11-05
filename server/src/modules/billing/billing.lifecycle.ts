import {
  BillingInterval,
  SubscriptionStatus,
} from '../../../generated/prisma/client';
import {
  GRACE_PERIOD_DAYS,
  MAX_RENEWAL_ATTEMPTS,
  PENDING_RENEWAL_BUFFER_HOURS,
  RETRY_DELAYS_HOURS,
} from './billing.constants';

const HOUR = 60 * 60 * 1000;

export type AccessState = {
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  graceEndsAt: Date | null;
};

export type FailureState = {
  failedAttempts: number;
  currentPeriodEnd: Date;
  graceEndsAt: Date | null;
};

export function addInterval(date: Date, interval: BillingInterval): Date {
  const months = interval === 'YEARLY' ? 12 : 1;
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(
    Date.UTC(
      year,
      month,
      Math.min(date.getUTCDate(), lastDay),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
    ),
  );
}

export function hasProAccess(
  subscription: AccessState | null,
  now: Date,
): boolean {
  if (!subscription) return false;
  switch (subscription.status) {
    case 'ACTIVE': {
      const buffer = subscription.cancelAtPeriodEnd
        ? 0
        : PENDING_RENEWAL_BUFFER_HOURS * HOUR;
      return now.getTime() < subscription.currentPeriodEnd.getTime() + buffer;
    }
    case 'PAST_DUE':
      return (
        subscription.graceEndsAt !== null &&
        now.getTime() < subscription.graceEndsAt.getTime()
      );
    default:
      return false;
  }
}

export function nextPeriodAfterRenewal(
  currentPeriodEnd: Date,
  interval: BillingInterval,
  now: Date,
): { start: Date; end: Date } {
  const end = addInterval(currentPeriodEnd, interval);
  if (end.getTime() > now.getTime()) return { start: currentPeriodEnd, end };
  return { start: now, end: addInterval(now, interval) };
}

export function afterFailedRenewal(
  state: FailureState,
  now: Date,
):
  | { status: 'EXPIRED'; failedAttempts: number }
  | {
      status: 'PAST_DUE';
      failedAttempts: number;
      graceEndsAt: Date;
      nextRetryAt: Date;
    } {
  const failedAttempts = state.failedAttempts + 1;
  const graceEndsAt =
    state.graceEndsAt ??
    new Date(state.currentPeriodEnd.getTime() + GRACE_PERIOD_DAYS * 24 * HOUR);
  if (
    failedAttempts >= MAX_RENEWAL_ATTEMPTS ||
    now.getTime() >= graceEndsAt.getTime()
  ) {
    return { status: 'EXPIRED', failedAttempts };
  }
  const delay = RETRY_DELAYS_HOURS[failedAttempts - 1] * HOUR;
  const nextRetryAt = new Date(
    Math.min(now.getTime() + delay, graceEndsAt.getTime() - HOUR),
  );
  return { status: 'PAST_DUE', failedAttempts, graceEndsAt, nextRetryAt };
}
