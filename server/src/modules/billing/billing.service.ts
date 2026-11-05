import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BillingCheckout,
  BillingInterval,
  CheckoutPurpose,
} from '../../../generated/prisma/client';
import { UsersService } from '../users/users.service';
import { BillingRepository, StoredPaymentMethod } from './billing.repository';
import { BillingRenewalService } from './billing-renewal.service';
import { addInterval, hasProAccess } from './billing.lifecycle';
import {
  BILLING_CURRENCY,
  CHECKOUT_TTL_MINUTES,
  DEFAULT_PLAN_PRICES,
  PAYMENT_HISTORY_LIMIT,
  VERIFICATION_AMOUNT,
} from './billing.constants';
import {
  CallbackHeaders,
  PAYMENT_PROVIDER,
  PaymentProvider,
  ProviderPaymentResult,
} from './providers/payment-provider';

const INTERVALS: BillingInterval[] = ['MONTHLY', 'YEARLY'];

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly repo: BillingRepository,
    private readonly users: UsersService,
    private readonly renewals: BillingRenewalService,
    private readonly config: ConfigService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: PaymentProvider,
  ) {}

  get providerName() {
    return this.provider.name;
  }

  planPrice(interval: BillingInterval): number {
    const override = Number(
      this.config.get<string>(`BILLING_PRICE_${interval}`),
    );
    return Number.isInteger(override) && override > 0
      ? override
      : DEFAULT_PLAN_PRICES[interval];
  }

  plans() {
    return INTERVALS.map((interval) => ({
      interval,
      amount: this.planPrice(interval),
      currency: BILLING_CURRENCY,
    }));
  }

  async hasProAccess(userId: string, now = new Date()): Promise<boolean> {
    return hasProAccess(await this.repo.findSubscription(userId), now);
  }

  async status(userId: string, now = new Date()) {
    const [subscription, payments] = await Promise.all([
      this.repo.findSubscription(userId),
      this.repo.findPayments(userId, PAYMENT_HISTORY_LIMIT),
    ]);
    const pro = hasProAccess(subscription, now);
    return {
      plan: pro ? ('PRO' as const) : ('FREE' as const),
      hasProAccess: pro,
      checkoutAvailable: this.provider.isConfigured(),
      plans: this.plans(),
      subscription: subscription
        ? {
            status: subscription.status,
            interval: subscription.interval,
            priceAmount: subscription.priceAmount,
            currency: subscription.currency,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            canceledAt: subscription.canceledAt,
            endedAt: subscription.endedAt,
            graceEndsAt: subscription.graceEndsAt,
            nextRetryAt: subscription.nextRetryAt,
            paymentMethod: subscription.cardLast4
              ? {
                  brand: subscription.cardBrand,
                  last4: subscription.cardLast4,
                  expiry: subscription.cardExpiry,
                }
              : null,
          }
        : null,
      payments,
    };
  }

  private assertAvailable() {
    if (!this.provider.isConfigured()) {
      throw new ServiceUnavailableException('Payments are not available');
    }
  }

  private returnUrls(returnUrl: string, checkoutId: string) {
    const separator = returnUrl.includes('?') ? '&' : '?';
    const base = `${returnUrl}${separator}checkout=${encodeURIComponent(checkoutId)}`;
    return {
      success: `${base}&result=success`,
      failure: `${base}&result=failure`,
    };
  }

  private callbackUrl() {
    const base = (
      this.config.get<string>('BILLING_PUBLIC_URL') ??
      `http://localhost:${this.config.get<string>('PORT') ?? '3000'}`
    ).replace(/\/$/, '');
    return `${base}/billing/webhooks/${this.provider.name}`;
  }

  private async startCheckout(
    userId: string,
    purpose: CheckoutPurpose,
    interval: BillingInterval | null,
    amount: number,
    returnUrl: string,
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException();
    const now = new Date();
    const checkout = await this.repo.createCheckout({
      userId,
      purpose,
      interval,
      amount,
      currency: BILLING_CURRENCY,
      provider: this.provider.name,
      returnUrl,
      expiresAt: new Date(now.getTime() + CHECKOUT_TTL_MINUTES * 60_000),
    });
    const urls = this.returnUrls(returnUrl, checkout.id);
    const session = await this.provider.createCheckout({
      reference: checkout.id,
      purpose,
      amount,
      currency: BILLING_CURRENCY,
      description:
        purpose === 'SUBSCRIBE'
          ? `BalanceOS Pro (${(interval ?? 'MONTHLY').toLowerCase()})`
          : 'BalanceOS payment method',
      customer: {
        id: user.id,
        name: user.fullName ?? user.email,
        email: user.email,
      },
      callbackUrl: this.callbackUrl(),
      successUrl: urls.success,
      failureUrl: urls.failure,
    });
    await this.repo.setCheckoutReference(
      checkout.id,
      session.providerReference,
    );
    return { checkoutId: checkout.id, url: session.url };
  }

  async createSubscriptionCheckout(
    userId: string,
    interval: BillingInterval,
    returnUrl: string,
  ) {
    this.assertAvailable();
    const subscription = await this.repo.findSubscription(userId);
    if (
      subscription &&
      (subscription.status === 'ACTIVE' ||
        subscription.status === 'PAST_DUE') &&
      hasProAccess(subscription, new Date())
    ) {
      throw new ConflictException('You already have an active subscription');
    }
    return this.startCheckout(
      userId,
      'SUBSCRIBE',
      interval,
      this.planPrice(interval),
      returnUrl,
    );
  }

  async createPaymentMethodCheckout(userId: string, returnUrl: string) {
    this.assertAvailable();
    const subscription = await this.repo.findSubscription(userId);
    if (
      !subscription ||
      (subscription.status !== 'ACTIVE' && subscription.status !== 'PAST_DUE')
    ) {
      throw new BadRequestException('There is no subscription to update');
    }
    return this.startCheckout(
      userId,
      'UPDATE_PAYMENT_METHOD',
      null,
      VERIFICATION_AMOUNT,
      returnUrl,
    );
  }

  async checkoutStatus(userId: string, checkoutId: string) {
    const now = new Date();
    await this.repo.expireCheckout(checkoutId, now);
    const checkout = await this.repo.findCheckoutForUser(checkoutId, userId);
    if (!checkout) throw new NotFoundException('Checkout not found');
    return {
      id: checkout.id,
      purpose: checkout.purpose,
      status: checkout.status,
      failureReason: checkout.failureReason,
    };
  }

  async cancel(userId: string) {
    const subscription = await this.repo.findSubscription(userId);
    if (
      !subscription ||
      (subscription.status !== 'ACTIVE' && subscription.status !== 'PAST_DUE')
    ) {
      throw new BadRequestException('There is no active subscription');
    }
    const now = new Date();
    if (subscription.status === 'PAST_DUE') {
      await this.repo.endSubscription(subscription.id, 'CANCELED', now);
    } else {
      await this.repo.setCancelAtPeriodEnd(subscription.id, true, now);
    }
    return this.status(userId, now);
  }

  async resume(userId: string) {
    const now = new Date();
    const subscription = await this.repo.findSubscription(userId);
    if (
      !subscription ||
      subscription.status !== 'ACTIVE' ||
      !subscription.cancelAtPeriodEnd ||
      subscription.currentPeriodEnd <= now
    ) {
      throw new BadRequestException('This subscription cannot be resumed');
    }
    await this.repo.setCancelAtPeriodEnd(subscription.id, false, now);
    return this.status(userId, now);
  }

  async handleCallback(
    providerName: string,
    headers: CallbackHeaders,
    body: unknown,
    rawBody?: Buffer,
  ): Promise<{ received: true }> {
    if (providerName !== this.provider.name) {
      throw new NotFoundException();
    }
    const result = this.provider.verifyCallback(headers, body, rawBody);
    if (!result) throw new UnauthorizedException('Invalid signature');

    const fresh = await this.repo.recordEvent(
      this.provider.name,
      result.eventKey,
      result.success ? 'payment.succeeded' : 'payment.failed',
      body,
    );
    if (!fresh || !result.reference) return { received: true };

    try {
      const checkout = await this.repo.findCheckout(result.reference);
      if (!checkout || checkout.status !== 'PENDING') return { received: true };
      if (checkout.provider !== this.provider.name) return { received: true };
      await this.applyCheckoutResult(checkout, result);
    } catch (error) {
      await this.repo.forgetEvent(this.provider.name, result.eventKey);
      throw error;
    }
    return { received: true };
  }

  private async applyCheckoutResult(
    checkout: BillingCheckout,
    result: ProviderPaymentResult,
  ) {
    const now = new Date();
    const failedPayment =
      checkout.purpose === 'SUBSCRIBE'
        ? {
            userId: checkout.userId,
            subscriptionId: null,
            kind: 'INITIAL' as const,
            status: 'FAILED' as const,
            amount: checkout.amount,
            currency: checkout.currency,
            providerTransactionId: result.transactionId,
          }
        : null;

    if (!result.success) {
      await this.repo.failCheckout(
        checkout.id,
        result.failureReason ?? 'declined',
        failedPayment && {
          ...failedPayment,
          failureReason: result.failureReason,
        },
      );
      return;
    }

    const amountMismatch =
      checkout.purpose === 'SUBSCRIBE' &&
      (result.amount !== checkout.amount ||
        (result.currency !== null && result.currency !== checkout.currency));
    if (amountMismatch) {
      this.logger.warn(`Amount mismatch on checkout ${checkout.id}`);
      await this.repo.failCheckout(checkout.id, 'amount_mismatch', null);
      return;
    }

    if (!result.token) {
      this.logger.warn(`No reusable card token on checkout ${checkout.id}`);
    }

    const method: StoredPaymentMethod = {
      provider: this.provider.name,
      providerToken: result.token,
      providerCustomerId: result.customerId,
      cardBrand: result.card.brand,
      cardLast4: result.card.last4,
      cardExpiry: result.card.expiry,
    };

    if (checkout.purpose === 'SUBSCRIBE' && checkout.interval) {
      await this.repo.completeSubscribeCheckout({
        checkoutId: checkout.id,
        userId: checkout.userId,
        interval: checkout.interval,
        amount: checkout.amount,
        currency: checkout.currency,
        periodStart: now,
        periodEnd: addInterval(now, checkout.interval),
        method,
        transactionId: result.transactionId,
      });
      return;
    }

    const subscriptionId = await this.repo.completePaymentMethodCheckout({
      checkoutId: checkout.id,
      userId: checkout.userId,
      method,
      transactionId: result.transactionId,
      currency: checkout.currency,
      retryNow: now,
    });
    if (subscriptionId) {
      await this.renewals.process(subscriptionId, now).catch(() => 'skipped');
    }
  }

  async checkoutForSandbox(checkoutId: string) {
    const checkout = await this.repo.findCheckout(checkoutId);
    if (!checkout || checkout.provider !== 'sandbox') {
      throw new NotFoundException('Checkout not found');
    }
    return checkout;
  }

  async forceRenewalForTesting(userId: string, declineToken: string | null) {
    const subscription = await this.repo.findSubscription(userId);
    if (!subscription) throw new BadRequestException('No subscription');
    const now = new Date();
    await this.repo.forceDueForTesting(
      subscription.id,
      now,
      declineToken,
      subscription.status === 'ACTIVE',
    );
    const outcome = await this.renewals.process(subscription.id, now);
    return { outcome, status: await this.status(userId) };
  }
}
