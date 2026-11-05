import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomBytes, randomUUID } from 'crypto';
import {
  CallbackHeaders,
  CheckoutRequest,
  CheckoutSession,
  header,
  hmacMatches,
  PaymentProvider,
  pickString,
  ProviderPaymentResult,
  TokenChargeRequest,
  TokenChargeResult,
} from './payment-provider';

export const SANDBOX_SIGNATURE_HEADER = 'x-sandbox-signature';
export const SANDBOX_DECLINE_TOKEN_PREFIX = 'sbx_decline_';
export const SANDBOX_OUTCOMES = [
  'approve',
  'approve_then_decline',
  'decline',
] as const;

export type SandboxOutcome = (typeof SANDBOX_OUTCOMES)[number];

@Injectable()
export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = 'sandbox';
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    this.secret =
      config.get<string>('BILLING_SANDBOX_SECRET') ??
      randomBytes(32).toString('hex');
  }

  isConfigured(): boolean {
    return this.config.get<string>('NODE_ENV') !== 'production';
  }

  private publicUrl() {
    return (
      this.config.get<string>('BILLING_PUBLIC_URL') ??
      `http://localhost:${this.config.get<string>('PORT') ?? '3000'}`
    ).replace(/\/$/, '');
  }

  createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    return Promise.resolve({
      url: `${this.publicUrl()}/billing/sandbox/pay/${request.reference}`,
      providerReference: `sbx_${request.reference}`,
    });
  }

  sign(body: unknown): string {
    return createHmac('sha256', this.secret)
      .update(JSON.stringify(body))
      .digest('base64');
  }

  buildCallback(
    reference: string,
    amount: number,
    currency: string,
    outcome: SandboxOutcome,
  ) {
    const approved = outcome !== 'decline';
    const tokenPrefix =
      outcome === 'approve_then_decline'
        ? SANDBOX_DECLINE_TOKEN_PREFIX
        : 'sbx_ok_';
    return {
      reference,
      transactionId: `sbx_txn_${randomUUID()}`,
      status: approved ? 'approved' : 'declined',
      amount,
      currency,
      customerId: 'sbx_customer',
      token: approved ? `${tokenPrefix}${randomUUID()}` : null,
      card: {
        brand: 'Visa',
        last4: approved ? '4242' : '0002',
        expiry: '12/30',
      },
    };
  }

  verifyCallback(
    headers: CallbackHeaders,
    body: unknown,
    rawBody?: Buffer,
  ): ProviderPaymentResult | null {
    const received = header(headers, SANDBOX_SIGNATURE_HEADER);
    if (!received || !this.isConfigured()) return null;
    if (!hmacMatches(this.secret, received, body, rawBody)) return null;
    const transactionId = pickString(body, 'transactionId');
    const approved = pickString(body, 'status') === 'approved';
    const amount = Number(pickString(body, 'amount'));
    return {
      eventKey: `sandbox:${transactionId ?? randomUUID()}`,
      reference: pickString(body, 'reference'),
      success: approved,
      transactionId,
      amount: Number.isFinite(amount) ? amount : null,
      currency: pickString(body, 'currency'),
      token: pickString(body, 'token'),
      customerId: pickString(body, 'customerId'),
      card: {
        brand: pickString(body, 'card.brand'),
        last4: pickString(body, 'card.last4'),
        expiry: pickString(body, 'card.expiry'),
      },
      failureReason: approved ? null : 'card_declined',
    };
  }

  chargeToken(request: TokenChargeRequest): Promise<TokenChargeResult> {
    const declined = request.token.startsWith(SANDBOX_DECLINE_TOKEN_PREFIX);
    return Promise.resolve({
      success: !declined,
      transactionId: `sbx_txn_${randomUUID()}`,
      failureReason: declined ? 'card_declined' : null,
    });
  }
}
