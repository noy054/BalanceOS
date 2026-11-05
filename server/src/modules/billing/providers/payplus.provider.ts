import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CallbackHeaders,
  CheckoutRequest,
  CheckoutSession,
  header,
  hmacMatches,
  PaymentProvider,
  pick,
  pickString,
  ProviderPaymentResult,
  TokenChargeRequest,
  TokenChargeResult,
} from './payment-provider';

const HOSTS = {
  production: 'https://restapi.payplus.co.il/api/v1.0',
  staging: 'https://restapidev.payplus.co.il/api/v1.0',
};
const SUCCESS_CODE = '000';
const REQUEST_TIMEOUT_MS = 15_000;
const CHARGE_METHOD = { CHARGE: 1, TOKEN: 5 };

function toShekels(agorot: number) {
  return Math.round(agorot) / 100;
}

@Injectable()
export class PayPlusProvider implements PaymentProvider {
  readonly name = 'payplus';
  private readonly logger = new Logger(PayPlusProvider.name);

  constructor(private readonly config: ConfigService) {}

  private setting(key: string): string | null {
    const value = this.config.get<string>(key)?.trim();
    return value ? value : null;
  }

  isConfigured(): boolean {
    return [
      'PAYPLUS_API_KEY',
      'PAYPLUS_SECRET_KEY',
      'PAYPLUS_PAYMENT_PAGE_UID',
      'PAYPLUS_TERMINAL_UID',
      'PAYPLUS_CASHIER_UID',
    ].every((key) => this.setting(key) !== null);
  }

  private get baseUrl() {
    return this.setting('PAYPLUS_ENV') === 'production'
      ? HOSTS.production
      : HOSTS.staging;
  }

  private async post(path: string, body: object): Promise<unknown> {
    const apiKey = this.setting('PAYPLUS_API_KEY');
    const secretKey = this.setting('PAYPLUS_SECRET_KEY');
    if (!apiKey || !secretKey) {
      throw new ServiceUnavailableException('Payments are not configured');
    }
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
        'secret-key': secretKey,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      this.logger.warn(`PayPlus ${path} failed with ${response.status}`);
    }
    return data;
  }

  async createCheckout(request: CheckoutRequest): Promise<CheckoutSession> {
    const amount = toShekels(request.amount);
    const data = await this.post('/PaymentPages/generateLink', {
      payment_page_uid: this.setting('PAYPLUS_PAYMENT_PAGE_UID'),
      charge_method:
        request.purpose === 'SUBSCRIBE'
          ? CHARGE_METHOD.CHARGE
          : CHARGE_METHOD.TOKEN,
      amount,
      currency_code: request.currency,
      create_token: true,
      payments: 1,
      sendEmailApproval: true,
      sendEmailFailure: false,
      refURL_success: request.successUrl,
      refURL_failure: request.failureUrl,
      refURL_callback: request.callbackUrl,
      more_info: request.reference,
      customer: {
        customer_name: request.customer.name,
        email: request.customer.email,
        customer_external_number: request.customer.id,
      },
      items: [
        { name: request.description, quantity: 1, price: amount, vat_type: 0 },
      ],
    });
    const url = pickString(data, 'data.payment_page_link');
    const providerReference = pickString(data, 'data.page_request_uid');
    if (!url || !providerReference) {
      throw new ServiceUnavailableException(
        'The payment page could not be created',
      );
    }
    return { url, providerReference };
  }

  verifyCallback(
    headers: CallbackHeaders,
    body: unknown,
    rawBody?: Buffer,
  ): ProviderPaymentResult | null {
    const secretKey = this.setting('PAYPLUS_SECRET_KEY');
    const received = header(headers, 'hash');
    if (
      !secretKey ||
      !received ||
      header(headers, 'user-agent') !== 'PayPlus'
    ) {
      return null;
    }
    if (!hmacMatches(secretKey, received, body, rawBody)) return null;

    const transactionId = pickString(body, 'transaction.uid');
    const statusCode = pickString(body, 'transaction.status_code');
    const amount = pick(body, 'transaction.amount');
    const month = pickString(body, 'data.card_information.expiry_month');
    const year = pickString(body, 'data.card_information.expiry_year');
    return {
      eventKey: `payplus:${transactionId ?? pickString(body, 'transaction.payment_request_uid') ?? 'unknown'}:${statusCode ?? 'none'}`,
      reference: pickString(body, 'transaction.more_info'),
      success: statusCode === SUCCESS_CODE,
      transactionId,
      amount: typeof amount === 'number' ? Math.round(amount * 100) : null,
      currency: pickString(body, 'transaction.currency'),
      token: pickString(
        body,
        'data.card_information.token',
        'data.token_uid',
        'transaction.token_uid',
      ),
      customerId: pickString(body, 'data.customer_uid'),
      card: {
        brand: pickString(
          body,
          'invoice.brand_name',
          'data.card_information.brand_name',
        ),
        last4: pickString(body, 'data.card_information.four_digits'),
        expiry:
          month && year ? `${month.padStart(2, '0')}/${year.slice(-2)}` : null,
      },
      failureReason:
        statusCode === SUCCESS_CODE
          ? null
          : `status_${statusCode ?? 'unknown'}`,
    };
  }

  async chargeToken(request: TokenChargeRequest): Promise<TokenChargeResult> {
    const amount = toShekels(request.amount);
    try {
      const data = await this.post('/Transactions/Charge', {
        terminal_uid: this.setting('PAYPLUS_TERMINAL_UID'),
        cashier_uid: this.setting('PAYPLUS_CASHIER_UID'),
        amount,
        currency_code: request.currency,
        credit_terms: 1,
        use_token: true,
        token: request.token,
        customer_uid: request.customerId,
        more_info_1: request.reference,
        products: [
          {
            name: request.description,
            quantity: 1,
            price: amount,
            vat_type: 0,
          },
        ],
      });
      const status = pickString(data, 'results.status');
      const statusCode = pickString(data, 'data.transaction.status_code');
      const success = status === 'success' && statusCode === SUCCESS_CODE;
      return {
        success,
        transactionId: pickString(data, 'data.transaction.uid'),
        failureReason: success
          ? null
          : (pickString(data, 'results.description') ??
            `status_${statusCode ?? 'unknown'}`),
      };
    } catch (error) {
      this.logger.warn(
        `PayPlus token charge failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return {
        success: false,
        transactionId: null,
        failureReason: 'provider_unavailable',
      };
    }
  }
}
