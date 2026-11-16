import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BillingRepository } from './billing.repository';
import {
  afterFailedRenewal,
  nextPeriodAfterRenewal,
} from './billing.lifecycle';
import { RENEWAL_LOCK_MINUTES, RENEWAL_SWEEP_MS } from './billing.constants';
import {
  PAYMENT_PROVIDER,
  PaymentProvider,
} from './providers/payment-provider';

const SWEEP_BATCH = 50;
const FIRST_SWEEP_DELAY_MS = 10_000;

export type RenewalOutcome =
  | 'skipped'
  | 'renewed'
  | 'retry_scheduled'
  | 'expired'
  | 'canceled';

@Injectable()
export class BillingRenewalService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BillingRenewalService.name);
  private timers: ReturnType<typeof setTimeout>[] = [];
  private sweeping = false;

  constructor(
    private readonly repo: BillingRepository,
    private readonly config: ConfigService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  onModuleInit() {
    if (this.config.get<string>('BILLING_RENEWALS') === 'off') return;
    this.timers.push(
      setTimeout(() => void this.sweep(), FIRST_SWEEP_DELAY_MS),
      setInterval(() => void this.sweep(), RENEWAL_SWEEP_MS),
    );
  }

  onModuleDestroy() {
    for (const timer of this.timers) clearTimeout(timer);
    this.timers = [];
  }

  async sweep(now = new Date()): Promise<void> {
    if (this.sweeping) return;
    this.sweeping = true;
    try {
      const ids = await this.repo.findDueSubscriptionIds(now, SWEEP_BATCH);
      for (const id of ids) {
        await this.process(id, now).catch((error: unknown) =>
          this.logger.error(
            `Renewal failed for subscription ${id}: ${error instanceof Error ? error.message : 'unknown error'}`,
          ),
        );
      }
    } finally {
      this.sweeping = false;
    }
  }

  async process(id: string, now = new Date()): Promise<RenewalOutcome> {
    const lockUntil = new Date(now.getTime() + RENEWAL_LOCK_MINUTES * 60_000);
    if (!(await this.repo.claimForRenewal(id, now, lockUntil)))
      return 'skipped';
    try {
      return await this.renew(id, now);
    } finally {
      await this.repo.releaseRenewal(id);
    }
  }

  private async renew(id: string, now: Date): Promise<RenewalOutcome> {
    const sub = await this.repo.findSubscriptionById(id);
    if (!sub) return 'skipped';
    const periodOver = sub.currentPeriodEnd.getTime() <= now.getTime();

    if (sub.status === 'ACTIVE' && sub.cancelAtPeriodEnd) {
      if (!periodOver) return 'skipped';
      await this.repo.endSubscription(id, 'CANCELED', sub.currentPeriodEnd);
      return 'canceled';
    }

    if (
      sub.status === 'PAST_DUE' &&
      sub.graceEndsAt &&
      sub.graceEndsAt <= now
    ) {
      await this.repo.endSubscription(id, 'EXPIRED', now);
      return 'expired';
    }

    const due =
      (sub.status === 'ACTIVE' && periodOver) ||
      (sub.status === 'PAST_DUE' &&
        sub.nextRetryAt !== null &&
        sub.nextRetryAt <= now);
    if (!due) return 'skipped';

    const base = {
      userId: sub.userId,
      subscriptionId: sub.id,
      kind: 'RENEWAL' as const,
      amount: sub.priceAmount,
      currency: sub.currency,
    };

    const result = sub.providerToken
      ? await this.provider.chargeToken({
          token: sub.providerToken,
          customerId: sub.providerCustomerId,
          amount: sub.priceAmount,
          currency: sub.currency,
          description: `TrackMode Pro (${sub.interval.toLowerCase()})`,
          reference: `renewal_${sub.id}_${sub.currentPeriodEnd.getTime()}_${sub.failedAttempts}`,
        })
      : {
          success: false,
          transactionId: null,
          failureReason: 'no_payment_method',
        };

    if (result.success) {
      const period = nextPeriodAfterRenewal(
        sub.currentPeriodEnd,
        sub.interval,
        now,
      );
      await this.repo.applyRenewalSuccess(id, period, {
        ...base,
        status: 'PAID',
        providerTransactionId: result.transactionId,
        periodStart: period.start,
        periodEnd: period.end,
      });
      return 'renewed';
    }

    const next = afterFailedRenewal(sub, now);
    const payment = {
      ...base,
      status: 'FAILED' as const,
      providerTransactionId: result.transactionId,
      failureReason: result.failureReason,
    };
    if (next.status === 'EXPIRED') {
      await this.repo.applyRenewalFailure(
        id,
        {
          status: 'EXPIRED',
          failedAttempts: next.failedAttempts,
          endedAt: now,
        },
        payment,
      );
      return 'expired';
    }
    await this.repo.applyRenewalFailure(id, next, payment);
    return 'retry_scheduled';
  }
}
