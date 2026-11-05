import {
  addInterval,
  afterFailedRenewal,
  hasProAccess,
  nextPeriodAfterRenewal,
} from './billing.lifecycle';
import { isAllowedReturnUrl } from './billing.return-url';

const day = 24 * 60 * 60 * 1000;

describe('addInterval', () => {
  it('keeps the billing day and clamps short months', () => {
    expect(
      addInterval(new Date('2026-01-31T10:00:00Z'), 'MONTHLY').toISOString(),
    ).toBe('2026-02-28T10:00:00.000Z');
    expect(
      addInterval(new Date('2028-02-29T10:00:00Z'), 'YEARLY').toISOString(),
    ).toBe('2029-02-28T10:00:00.000Z');
  });
});

describe('hasProAccess', () => {
  const end = new Date('2026-12-01T00:00:00Z');

  it('grants access during an active period and a short renewal buffer', () => {
    const sub = {
      status: 'ACTIVE' as const,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      graceEndsAt: null,
    };
    expect(hasProAccess(sub, new Date(end.getTime() - day))).toBe(true);
    expect(hasProAccess(sub, new Date(end.getTime() + day / 2))).toBe(true);
    expect(hasProAccess(sub, new Date(end.getTime() + 2 * day))).toBe(false);
  });

  it('ends access exactly at period end once canceled', () => {
    const sub = {
      status: 'ACTIVE' as const,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: true,
      graceEndsAt: null,
    };
    expect(hasProAccess(sub, new Date(end.getTime() - 1))).toBe(true);
    expect(hasProAccess(sub, end)).toBe(false);
  });

  it('keeps access during the grace period after a failed payment', () => {
    const sub = {
      status: 'PAST_DUE' as const,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      graceEndsAt: new Date(end.getTime() + 7 * day),
    };
    expect(hasProAccess(sub, new Date(end.getTime() + 3 * day))).toBe(true);
    expect(hasProAccess(sub, new Date(end.getTime() + 8 * day))).toBe(false);
  });

  it('denies access without a subscription or after it ended', () => {
    expect(hasProAccess(null, end)).toBe(false);
    expect(
      hasProAccess(
        {
          status: 'EXPIRED',
          currentPeriodEnd: end,
          cancelAtPeriodEnd: false,
          graceEndsAt: null,
        },
        new Date(end.getTime() - day),
      ),
    ).toBe(false);
  });
});

describe('renewal transitions', () => {
  const periodEnd = new Date('2026-12-01T00:00:00Z');

  it('continues from the previous period end after a successful renewal', () => {
    const period = nextPeriodAfterRenewal(
      periodEnd,
      'MONTHLY',
      new Date(periodEnd.getTime() + day),
    );
    expect(period.start).toEqual(periodEnd);
    expect(period.end.toISOString()).toBe('2027-01-01T00:00:00.000Z');
  });

  it('schedules retries inside the grace period, then expires', () => {
    let state = {
      failedAttempts: 0,
      currentPeriodEnd: periodEnd,
      graceEndsAt: null as Date | null,
    };
    const first = afterFailedRenewal(state, periodEnd);
    expect(first.status).toBe('PAST_DUE');
    if (first.status !== 'PAST_DUE') return;
    expect(first.graceEndsAt.getTime()).toBe(periodEnd.getTime() + 7 * day);
    expect(first.nextRetryAt.getTime()).toBe(periodEnd.getTime() + day);

    state = { ...state, failedAttempts: 3, graceEndsAt: first.graceEndsAt };
    expect(
      afterFailedRenewal(state, new Date(periodEnd.getTime() + 6 * day)).status,
    ).toBe('EXPIRED');
  });
});

describe('isAllowedReturnUrl', () => {
  const dev = { production: false, webOrigins: [] };
  const prod = { production: true, webOrigins: ['https://app.balanceos.com'] };

  it('accepts the app scheme and configured web origins', () => {
    expect(isAllowedReturnUrl('balanceos://settings/billing', prod)).toBe(true);
    expect(
      isAllowedReturnUrl('https://app.balanceos.com/settings/billing', prod),
    ).toBe(true);
  });

  it('accepts local development addresses only outside production', () => {
    expect(
      isAllowedReturnUrl('http://localhost:8081/settings/billing', dev),
    ).toBe(true);
    expect(
      isAllowedReturnUrl('exp://192.168.1.5:8081/--/settings/billing', dev),
    ).toBe(true);
    expect(
      isAllowedReturnUrl('http://localhost:8081/settings/billing', prod),
    ).toBe(false);
  });

  it('rejects other sites and malformed addresses', () => {
    expect(isAllowedReturnUrl('https://evil.example/steal', prod)).toBe(false);
    expect(isAllowedReturnUrl('javascript:alert(1)', dev)).toBe(false);
    expect(isAllowedReturnUrl('not a url', dev)).toBe(false);
  });
});
