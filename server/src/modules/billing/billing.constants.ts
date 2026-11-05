import { BillingInterval } from '../../../generated/prisma/client';

export const BILLING_CURRENCY = 'ILS';

export const DEFAULT_PLAN_PRICES: Record<BillingInterval, number> = {
  MONTHLY: 2990,
  YEARLY: 24900,
};

export const VERIFICATION_AMOUNT = 100;
export const CHECKOUT_TTL_MINUTES = 60;
export const GRACE_PERIOD_DAYS = 7;
export const RETRY_DELAYS_HOURS = [24, 72, 120];
export const MAX_RENEWAL_ATTEMPTS = RETRY_DELAYS_HOURS.length + 1;
export const PENDING_RENEWAL_BUFFER_HOURS = 24;
export const RENEWAL_SWEEP_MS = 15 * 60 * 1000;
export const RENEWAL_LOCK_MINUTES = 10;
export const PAYMENT_HISTORY_LIMIT = 12;
