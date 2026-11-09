import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { BillingService } from './billing.service';
import { BillingRepository } from './billing.repository';
import { BillingRenewalService } from './billing-renewal.service';
import { UsersService } from '../users/users.service';
import { PayPlusProvider } from './providers/payplus.provider';
import {
  PaymentProvider,
  ProviderPaymentResult,
} from './providers/payment-provider';

function config(values: Record<string, string>) {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

function result(
  overrides: Partial<ProviderPaymentResult>,
): ProviderPaymentResult {
  return {
    eventKey: 'evt-1',
    reference: 'chk-1',
    success: true,
    transactionId: 'txn-1',
    amount: 2990,
    currency: 'ILS',
    token: 'tok-1',
    customerId: 'cus-1',
    card: { brand: 'Visa', last4: '4242', expiry: '12/30' },
    failureReason: null,
    ...overrides,
  };
}

function setup(callback: ProviderPaymentResult | null) {
  const repo = {
    recordEvent: jest.fn().mockResolvedValue(true),
    findCheckout: jest.fn().mockResolvedValue({
      id: 'chk-1',
      userId: 'u1',
      purpose: 'SUBSCRIBE',
      interval: 'MONTHLY',
      amount: 2990,
      currency: 'ILS',
      status: 'PENDING',
      provider: 'test',
    }),
    completeSubscribeCheckout: jest.fn().mockResolvedValue(true),
    failCheckout: jest.fn().mockResolvedValue(true),
    forgetEvent: jest.fn().mockResolvedValue(undefined),
  };
  const provider: PaymentProvider = {
    name: 'test',
    isConfigured: () => true,
    createCheckout: jest.fn(),
    verifyCallback: () => callback,
    chargeToken: jest.fn(),
  };
  const service = new BillingService(
    repo as unknown as BillingRepository,
    {} as UsersService,
    {} as BillingRenewalService,
    config({}),
    provider,
  );
  return { service, repo };
}

describe('BillingService.handleCallback', () => {
  it('rejects callbacks that fail signature verification', async () => {
    const { service } = setup(null);
    await expect(service.handleCallback('test', {}, {})).rejects.toThrow(
      'Invalid signature',
    );
  });

  it('activates the subscription for a verified successful payment', async () => {
    const { service, repo } = setup(result({}));
    await service.handleCallback('test', {}, {});
    expect(repo.completeSubscribeCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        checkoutId: 'chk-1',
        userId: 'u1',
        interval: 'MONTHLY',
        amount: 2990,
        method: expect.objectContaining({
          providerToken: 'tok-1',
          cardLast4: '4242',
        }) as unknown,
      }),
    );
  });

  it('ignores a repeated event', async () => {
    const { service, repo } = setup(result({}));
    repo.recordEvent.mockResolvedValue(false);
    await service.handleCallback('test', {}, {});
    expect(repo.completeSubscribeCheckout).not.toHaveBeenCalled();
  });

  it('releases the event when processing fails so the provider retry is applied', async () => {
    const { service, repo } = setup(result({}));
    repo.completeSubscribeCheckout.mockRejectedValueOnce(new Error('db down'));
    await expect(service.handleCallback('test', {}, {})).rejects.toThrow(
      'db down',
    );
    expect(repo.forgetEvent).toHaveBeenCalledWith('test', 'evt-1');

    await service.handleCallback('test', {}, {});
    expect(repo.completeSubscribeCheckout).toHaveBeenCalledTimes(2);
  });

  it('refuses a payment whose amount differs from the checkout', async () => {
    const { service, repo } = setup(result({ amount: 100 }));
    await service.handleCallback('test', {}, {});
    expect(repo.completeSubscribeCheckout).not.toHaveBeenCalled();
    expect(repo.failCheckout).toHaveBeenCalledWith(
      'chk-1',
      'amount_mismatch',
      null,
    );
  });

  it('records a declined payment without activating anything', async () => {
    const { service, repo } = setup(
      result({ success: false, failureReason: 'card_declined' }),
    );
    await service.handleCallback('test', {}, {});
    expect(repo.completeSubscribeCheckout).not.toHaveBeenCalled();
    expect(repo.failCheckout).toHaveBeenCalledWith(
      'chk-1',
      'card_declined',
      expect.objectContaining({ status: 'FAILED', kind: 'INITIAL' }),
    );
  });
});

describe('PayPlusProvider.verifyCallback', () => {
  const secret = 'test-secret';
  const provider = new PayPlusProvider(config({ PAYPLUS_SECRET_KEY: secret }));
  const body = {
    transaction_type: 'Charge',
    transaction: {
      uid: 'txn-9',
      payment_request_uid: 'req-9',
      status_code: '000',
      amount: 29.9,
      currency: 'ILS',
      more_info: 'chk-9',
    },
    data: {
      customer_uid: 'cus-9',
      card_information: {
        four_digits: '1234',
        expiry_month: '4',
        expiry_year: '2029',
        token: 'tok-9',
      },
    },
  };
  const hash = createHmac('sha256', secret)
    .update(JSON.stringify(body))
    .digest('base64');

  it('accepts a correctly signed PayPlus callback and maps its fields', () => {
    const parsed = provider.verifyCallback(
      { 'user-agent': 'PayPlus', hash },
      body,
    );
    expect(parsed).toMatchObject({
      reference: 'chk-9',
      success: true,
      transactionId: 'txn-9',
      amount: 2990,
      token: 'tok-9',
      customerId: 'cus-9',
      card: { last4: '1234', expiry: '04/29' },
    });
  });

  it('verifies the signature against the raw bytes PayPlus sent', () => {
    const raw = Buffer.from(
      JSON.stringify(body)
        .replace('"amount":29.9', '"amount":29.90')
        .replace('"more_info":"chk-9"', '"more_info":"chk\\/9"'),
    );
    const parsed = JSON.parse(raw.toString()) as unknown;
    const rawHash = createHmac('sha256', secret).update(raw).digest('base64');
    expect(
      provider.verifyCallback(
        { 'user-agent': 'PayPlus', hash: rawHash },
        parsed,
      ),
    ).toBeNull();
    expect(
      provider.verifyCallback(
        { 'user-agent': 'PayPlus', hash: rawHash },
        parsed,
        raw,
      ),
    ).toMatchObject({ reference: 'chk/9', amount: 2990 });
  });

  it('rejects a tampered body or a missing PayPlus user agent', () => {
    expect(
      provider.verifyCallback(
        { 'user-agent': 'PayPlus', hash },
        { ...body, transaction: { ...body.transaction, amount: 0.1 } },
      ),
    ).toBeNull();
    expect(
      provider.verifyCallback({ 'user-agent': 'curl', hash }, body),
    ).toBeNull();
  });
});

describe('BillingService feature access', () => {
  function service(values: Record<string, string>, subscription: unknown) {
    const repo = {
      findSubscription: jest.fn().mockResolvedValue(subscription),
    };
    const provider = { name: 'test' } as unknown as PaymentProvider;
    return {
      repo,
      billing: new BillingService(
        repo as unknown as BillingRepository,
        {} as UsersService,
        {} as BillingRenewalService,
        config(values),
        provider,
      ),
    };
  }

  it('opens every feature while enforcement is off', async () => {
    const { billing, repo } = service({}, null);
    await expect(billing.hasFeatureAccess('u1')).resolves.toBe(true);
    expect(repo.findSubscription).not.toHaveBeenCalled();
  });

  it('requires an active subscription once enforcement is on', async () => {
    const { billing } = service({ BILLING_ENFORCE_ACCESS: 'true' }, null);
    await expect(billing.hasFeatureAccess('u1')).resolves.toBe(false);
  });
});
