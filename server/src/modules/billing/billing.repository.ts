import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BillingInterval,
  BillingPaymentKind,
  BillingPaymentStatus,
  CheckoutPurpose,
  Prisma,
  SubscriptionStatus,
} from '../../../generated/prisma/client';

export type PaymentRecord = {
  userId: string;
  subscriptionId: string | null;
  kind: BillingPaymentKind;
  status: BillingPaymentStatus;
  amount: number;
  currency: string;
  providerTransactionId: string | null;
  failureReason?: string | null;
  periodStart?: Date | null;
  periodEnd?: Date | null;
};

export type StoredPaymentMethod = {
  provider: string;
  providerToken: string | null;
  providerCustomerId: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpiry: string | null;
};

const PAYMENT_SELECT = {
  id: true,
  kind: true,
  status: true,
  amount: true,
  currency: true,
  failureReason: true,
  periodStart: true,
  periodEnd: true,
  createdAt: true,
} as const satisfies Prisma.BillingPaymentSelect;

function isUniqueViolation(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class BillingRepository {
  constructor(private readonly prisma: PrismaService) {}

  findSubscription(userId: string) {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  findSubscriptionById(id: string) {
    return this.prisma.subscription.findUnique({ where: { id } });
  }

  findPayments(userId: string, take: number) {
    return this.prisma.billingPayment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      select: PAYMENT_SELECT,
    });
  }

  createCheckout(data: {
    userId: string;
    purpose: CheckoutPurpose;
    interval: BillingInterval | null;
    amount: number;
    currency: string;
    provider: string;
    returnUrl: string;
    expiresAt: Date;
  }) {
    return this.prisma.billingCheckout.create({ data });
  }

  setCheckoutReference(id: string, providerReference: string) {
    return this.prisma.billingCheckout.update({
      where: { id },
      data: { providerReference },
    });
  }

  findCheckout(id: string) {
    return this.prisma.billingCheckout.findUnique({ where: { id } });
  }

  findCheckoutForUser(id: string, userId: string) {
    return this.prisma.billingCheckout.findFirst({ where: { id, userId } });
  }

  async expireCheckout(id: string, now: Date) {
    await this.prisma.billingCheckout.updateMany({
      where: { id, status: 'PENDING', expiresAt: { lte: now } },
      data: { status: 'EXPIRED' },
    });
  }

  async forgetEvent(provider: string, eventKey: string): Promise<void> {
    await this.prisma.billingEvent.deleteMany({
      where: { provider, eventKey },
    });
  }

  async recordEvent(
    provider: string,
    eventKey: string,
    type: string,
    payload: unknown,
  ): Promise<boolean> {
    try {
      await this.prisma.billingEvent.create({
        data: {
          provider,
          eventKey,
          type,
          payload: JSON.parse(
            JSON.stringify(payload ?? null),
          ) as Prisma.InputJsonValue,
        },
      });
      return true;
    } catch (error) {
      if (isUniqueViolation(error)) return false;
      throw error;
    }
  }

  async failCheckout(
    checkoutId: string,
    reason: string,
    payment: PaymentRecord | null,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.billingCheckout.updateMany({
        where: { id: checkoutId, status: 'PENDING' },
        data: {
          status: 'FAILED',
          failureReason: reason,
          completedAt: new Date(),
        },
      });
      if (updated.count !== 1) return false;
      if (payment) await tx.billingPayment.create({ data: payment });
      return true;
    });
  }

  async completeSubscribeCheckout(params: {
    checkoutId: string;
    userId: string;
    interval: BillingInterval;
    amount: number;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
    method: StoredPaymentMethod;
    transactionId: string | null;
  }): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.billingCheckout.updateMany({
        where: { id: params.checkoutId, status: 'PENDING' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
      if (claimed.count !== 1) return false;
      const values = {
        interval: params.interval,
        status: SubscriptionStatus.ACTIVE,
        priceAmount: params.amount,
        currency: params.currency,
        currentPeriodStart: params.periodStart,
        currentPeriodEnd: params.periodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
        endedAt: null,
        failedAttempts: 0,
        nextRetryAt: null,
        graceEndsAt: null,
        renewalLockedUntil: null,
        ...params.method,
      };
      const subscription = await tx.subscription.upsert({
        where: { userId: params.userId },
        create: { userId: params.userId, ...values },
        update: values,
      });
      await tx.billingPayment.create({
        data: {
          userId: params.userId,
          subscriptionId: subscription.id,
          kind: 'INITIAL',
          status: 'PAID',
          amount: params.amount,
          currency: params.currency,
          providerTransactionId: params.transactionId,
          periodStart: params.periodStart,
          periodEnd: params.periodEnd,
        },
      });
      return true;
    });
  }

  async completePaymentMethodCheckout(params: {
    checkoutId: string;
    userId: string;
    method: StoredPaymentMethod;
    transactionId: string | null;
    currency: string;
    retryNow: Date;
  }): Promise<string | null> {
    return this.prisma.$transaction(async (tx) => {
      const claimed = await tx.billingCheckout.updateMany({
        where: { id: params.checkoutId, status: 'PENDING' },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
      if (claimed.count !== 1) return null;
      const subscription = await tx.subscription.findUnique({
        where: { userId: params.userId },
      });
      if (!subscription) return null;
      await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          ...params.method,
          ...(subscription.status === 'PAST_DUE'
            ? { nextRetryAt: params.retryNow }
            : {}),
        },
      });
      await tx.billingPayment.create({
        data: {
          userId: params.userId,
          subscriptionId: subscription.id,
          kind: 'VERIFICATION',
          status: 'PAID',
          amount: 0,
          currency: params.currency,
          providerTransactionId: params.transactionId,
        },
      });
      return subscription.id;
    });
  }

  setCancelAtPeriodEnd(id: string, cancel: boolean, now: Date) {
    return this.prisma.subscription.update({
      where: { id },
      data: { cancelAtPeriodEnd: cancel, canceledAt: cancel ? now : null },
    });
  }

  async findDueSubscriptionIds(now: Date, take: number): Promise<string[]> {
    const rows = await this.prisma.subscription.findMany({
      where: {
        AND: [
          {
            OR: [
              { renewalLockedUntil: null },
              { renewalLockedUntil: { lt: now } },
            ],
          },
          {
            OR: [
              { status: 'ACTIVE', currentPeriodEnd: { lte: now } },
              { status: 'PAST_DUE', nextRetryAt: { lte: now } },
              { status: 'PAST_DUE', graceEndsAt: { lte: now } },
            ],
          },
        ],
      },
      orderBy: { currentPeriodEnd: 'asc' },
      take,
      select: { id: true },
    });
    return rows.map((row) => row.id);
  }

  async claimForRenewal(id: string, now: Date, until: Date): Promise<boolean> {
    const result = await this.prisma.subscription.updateMany({
      where: {
        id,
        OR: [{ renewalLockedUntil: null }, { renewalLockedUntil: { lt: now } }],
      },
      data: { renewalLockedUntil: until },
    });
    return result.count === 1;
  }

  async releaseRenewal(id: string) {
    await this.prisma.subscription.updateMany({
      where: { id },
      data: { renewalLockedUntil: null },
    });
  }

  async endSubscription(
    id: string,
    status: SubscriptionStatus,
    endedAt: Date,
    failedAttempts?: number,
  ) {
    await this.prisma.subscription.update({
      where: { id },
      data: {
        status,
        endedAt,
        nextRetryAt: null,
        ...(failedAttempts !== undefined ? { failedAttempts } : {}),
      },
    });
  }

  async applyRenewalSuccess(
    id: string,
    period: { start: Date; end: Date },
    payment: PaymentRecord,
  ) {
    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          currentPeriodStart: period.start,
          currentPeriodEnd: period.end,
          failedAttempts: 0,
          nextRetryAt: null,
          graceEndsAt: null,
        },
      }),
      this.prisma.billingPayment.create({ data: payment }),
    ]);
  }

  async applyRenewalFailure(
    id: string,
    state: {
      status: SubscriptionStatus;
      failedAttempts: number;
      graceEndsAt?: Date;
      nextRetryAt?: Date;
      endedAt?: Date;
    },
    payment: PaymentRecord,
  ) {
    await this.prisma.$transaction([
      this.prisma.subscription.update({
        where: { id },
        data: {
          status: state.status,
          failedAttempts: state.failedAttempts,
          graceEndsAt: state.graceEndsAt ?? undefined,
          nextRetryAt: state.nextRetryAt ?? null,
          endedAt: state.endedAt ?? null,
        },
      }),
      this.prisma.billingPayment.create({ data: payment }),
    ]);
  }

  async forceDueForTesting(
    id: string,
    now: Date,
    token: string | null,
    moveEnd: boolean,
  ) {
    await this.prisma.subscription.update({
      where: { id },
      data: {
        ...(moveEnd ? { currentPeriodEnd: now } : {}),
        ...(token ? { providerToken: token } : {}),
        nextRetryAt: now,
        renewalLockedUntil: null,
      },
    });
  }
}
