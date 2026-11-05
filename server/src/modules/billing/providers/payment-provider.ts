import { createHmac, timingSafeEqual } from 'crypto';
import { CheckoutPurpose } from '../../../../generated/prisma/client';

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

export type CallbackHeaders = Record<string, string | string[] | undefined>;

export type ProviderCard = {
  brand: string | null;
  last4: string | null;
  expiry: string | null;
};

export type CheckoutRequest = {
  reference: string;
  purpose: CheckoutPurpose;
  amount: number;
  currency: string;
  description: string;
  customer: { id: string; name: string; email: string };
  callbackUrl: string;
  successUrl: string;
  failureUrl: string;
};

export type CheckoutSession = {
  url: string;
  providerReference: string;
};

export type ProviderPaymentResult = {
  eventKey: string;
  reference: string | null;
  success: boolean;
  transactionId: string | null;
  amount: number | null;
  currency: string | null;
  token: string | null;
  customerId: string | null;
  card: ProviderCard;
  failureReason: string | null;
};

export type TokenChargeRequest = {
  token: string;
  customerId: string | null;
  amount: number;
  currency: string;
  description: string;
  reference: string;
};

export type TokenChargeResult = {
  success: boolean;
  transactionId: string | null;
  failureReason: string | null;
};

export interface PaymentProvider {
  readonly name: string;
  isConfigured(): boolean;
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  verifyCallback(
    headers: CallbackHeaders,
    body: unknown,
    rawBody?: Buffer,
  ): ProviderPaymentResult | null;
  chargeToken(request: TokenChargeRequest): Promise<TokenChargeResult>;
}

export function hmacMatches(
  secret: string,
  received: string,
  body: unknown,
  rawBody?: Buffer,
): boolean {
  const expectedFor = (payload: Buffer | string) =>
    Buffer.from(createHmac('sha256', secret).update(payload).digest('base64'));
  const actual = Buffer.from(received);
  const payloads: Array<Buffer | string> = rawBody?.length
    ? [rawBody, JSON.stringify(body)]
    : [JSON.stringify(body)];
  return payloads.some((payload) => {
    const expected = expectedFor(payload);
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  });
}

export function header(headers: CallbackHeaders, name: string): string | null {
  const value = headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export function pick(source: unknown, path: string): unknown {
  let current: unknown = source;
  for (const key of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

export function pickString(source: unknown, ...paths: string[]): string | null {
  for (const path of paths) {
    const value = pick(source, path);
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value))
      return String(value);
  }
  return null;
}
