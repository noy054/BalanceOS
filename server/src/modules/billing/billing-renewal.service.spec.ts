import { ConfigService } from '@nestjs/config';
import { BillingRenewalService } from './billing-renewal.service';
import { BillingRepository } from './billing.repository';
import { PaymentProvider } from './providers/payment-provider';

const day = 24 * 60 * 60 * 1000;
const periodEnd = new Date('2026-12-01T00:00:00Z');

function subscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 's1',
    userId: 'u1',
    interval: 'MONTHLY',
    status: 'ACTIVE',
    priceAmount: 2990,
    currency: 'ILS',
    currentPeriodStart: new Date(periodEnd.getTime() - 30 * day),
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    providerToken: 'tok',
    providerCustomerId: 'cus',
    failedAttempts: 0,
    nextRetryAt: null,
    graceEndsAt: null,
    ...overrides,
  };
}

function setup(sub: ReturnType<typeof subscription>, chargeSucceeds: boolean) {
  const repo = {
    claimForRenewal: jest.fn().mockResolvedValue(true),
    releaseRenewal: jest.fn().mockResolvedValue(undefined),
    findSubscriptionById: jest.fn().mockResolvedValue(sub),
    endSubscription: jest.fn().mockResolvedValue(undefined),
    applyRenewalSuccess: jest.fn().mockResolvedValue(undefined),
    applyRenewalFailure: jest.fn().mockResolvedValue(undefined),
  };
  const provider = {
    name: 'test',
    chargeToken: jest.fn().mockResolvedValue({
      success: chargeSucceeds,
      transactionId: 'txn',
      failureReason: chargeSucceeds ? null : 'card_declined',
    }),
  } as unknown as PaymentProvider;
  const service = new BillingRenewalService(
    repo as unknown as BillingRepository,
    { get: () => undefined } as unknown as ConfigService,
    provider,
  );
  return { service, repo, provider };
}

describe('BillingRenewalService', () => {
  it('charges the saved card and starts the next period', async () => {
    const { service, repo, provider } = setup(subscription(), true);
    const outcome = await service.process(
      's1',
      new Date(periodEnd.getTime() + 1000),
    );
    expect(outcome).toBe('renewed');
    expect(provider.chargeToken).toHaveBeenCalledWith(
      expect.objectContaining({ token: 'tok', amount: 2990 }),
    );
    expect(repo.applyRenewalSuccess).toHaveBeenCalledWith(
      's1',
      { start: periodEnd, end: new Date('2027-01-01T00:00:00Z') },
      expect.objectContaining({ status: 'PAID', kind: 'RENEWAL' }),
    );
    expect(repo.releaseRenewal).toHaveBeenCalledWith('s1');
  });

  it('moves to past due with a retry when the charge fails', async () => {
    const { service, repo } = setup(subscription(), false);
    const outcome = await service.process('s1', periodEnd);
    expect(outcome).toBe('retry_scheduled');
    expect(repo.applyRenewalFailure).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ status: 'PAST_DUE', failedAttempts: 1 }),
      expect.objectContaining({
        status: 'FAILED',
        failureReason: 'card_declined',
      }),
    );
  });

  it('ends a canceled subscription at period end without charging', async () => {
    const { service, repo, provider } = setup(
      subscription({ cancelAtPeriodEnd: true }),
      true,
    );
    expect(await service.process('s1', periodEnd)).toBe('canceled');
    expect(provider.chargeToken).not.toHaveBeenCalled();
    expect(repo.endSubscription).toHaveBeenCalledWith(
      's1',
      'CANCELED',
      periodEnd,
    );
  });

  it('expires a past-due subscription when the grace period is over', async () => {
    const { service, repo, provider } = setup(
      subscription({
        status: 'PAST_DUE',
        failedAttempts: 2,
        graceEndsAt: new Date(periodEnd.getTime() + 7 * day),
      }),
      true,
    );
    const now = new Date(periodEnd.getTime() + 8 * day);
    expect(await service.process('s1', now)).toBe('expired');
    expect(provider.chargeToken).not.toHaveBeenCalled();
    expect(repo.endSubscription).toHaveBeenCalledWith('s1', 'EXPIRED', now);
  });

  it('does nothing when another worker holds the renewal', async () => {
    const { service, repo, provider } = setup(subscription(), true);
    repo.claimForRenewal.mockResolvedValue(false);
    expect(await service.process('s1', periodEnd)).toBe('skipped');
    expect(provider.chargeToken).not.toHaveBeenCalled();
  });
});
