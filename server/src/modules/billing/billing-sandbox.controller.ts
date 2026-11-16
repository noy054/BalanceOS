import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { BillingService } from './billing.service';
import { SandboxPayDto, SandboxRenewDto } from './dto/billing.dto';
import {
  SANDBOX_DECLINE_TOKEN_PREFIX,
  SANDBOX_SIGNATURE_HEADER,
  SandboxPaymentProvider,
} from './providers/sandbox.provider';

const PAGE_STYLE = [
  'body{font-family:system-ui,sans-serif;background:#F6F7FA;color:#191C26;margin:0;padding:24px;display:flex;justify-content:center}',
  'main{max-width:420px;width:100%;background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,.06)}',
  'h1{font-size:20px;margin:0 0 4px}',
  'p{color:#586176;margin:0 0 16px}',
  '.amount{font-size:32px;font-weight:700;margin:12px 0 20px}',
  'form{margin:0 0 10px}',
  'button{width:100%;min-height:48px;border-radius:12px;border:1px solid #d9dde6;font-size:16px;font-weight:600;cursor:pointer;background:#fff;color:#191C26}',
  'button.primary{background:#C5F87F;border-color:#C5F87F}',
  '.note{font-size:13px;margin-top:16px}',
].join('');

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

function formatAmount(agorot: number, currency: string) {
  return `${(agorot / 100).toFixed(2)} ${escapeHtml(currency)}`;
}

@Controller('billing/sandbox')
export class BillingSandboxController {
  constructor(
    private readonly billing: BillingService,
    private readonly sandbox: SandboxPaymentProvider,
    private readonly config: ConfigService,
  ) {}

  private assertEnabled() {
    if (
      this.billing.providerName !== 'sandbox' ||
      this.config.get<string>('NODE_ENV') === 'production'
    ) {
      throw new NotFoundException();
    }
  }

  @Get('pay/:checkoutId')
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  async page(@Param('checkoutId') checkoutId: string) {
    this.assertEnabled();
    const checkout = await this.billing.checkoutForSandbox(checkoutId);
    const id = escapeHtml(checkout.id);
    const title =
      checkout.purpose === 'SUBSCRIBE'
        ? `TrackMode Pro · ${escapeHtml((checkout.interval ?? '').toLowerCase())}`
        : 'Update payment method';
    const button = (outcome: string, label: string, tone: string) =>
      [
        `<form method="post" action="/billing/sandbox/pay/${id}">`,
        `<input type="hidden" name="outcome" value="${outcome}">`,
        `<button class="${tone}" type="submit">${label}</button>`,
        '</form>',
      ].join('');
    const actions =
      checkout.status === 'PENDING'
        ? button('approve', 'Pay with test card •••• 4242', 'primary') +
          button('approve_then_decline', 'Pay, then decline renewals', '') +
          button('decline', 'Decline payment', '')
        : `<p>This checkout is ${escapeHtml(checkout.status.toLowerCase())}.</p>`;
    return [
      '<!doctype html><html lang="en"><head><meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      `<title>Sandbox checkout</title><style>${PAGE_STYLE}</style></head>`,
      `<body><main><h1>${title}</h1>`,
      '<p>Sandbox payment page. No real card is charged.</p>',
      `<div class="amount">${formatAmount(checkout.amount, checkout.currency)}</div>`,
      actions,
      `<p class="note">Test checkout ${id}</p></main></body></html>`,
    ].join('');
  }

  @Post('pay/:checkoutId')
  async pay(
    @Param('checkoutId') checkoutId: string,
    @Body() dto: SandboxPayDto,
    @Res() res: Response,
  ) {
    this.assertEnabled();
    const checkout = await this.billing.checkoutForSandbox(checkoutId);
    if (checkout.status === 'PENDING') {
      const payload = this.sandbox.buildCallback(
        checkout.id,
        checkout.amount,
        checkout.currency,
        dto.outcome,
      );
      await this.billing.handleCallback(
        'sandbox',
        { [SANDBOX_SIGNATURE_HEADER]: this.sandbox.sign(payload) },
        payload,
      );
    }
    const final = await this.billing.checkoutForSandbox(checkoutId);
    const result = final.status === 'COMPLETED' ? 'success' : 'failure';
    const target = checkout.returnUrl;
    if (!target) {
      res.status(200).send('Payment processed. You can return to the app.');
      return;
    }
    const separator = target.includes('?') ? '&' : '?';
    res.redirect(
      303,
      `${target}${separator}checkout=${encodeURIComponent(checkout.id)}&result=${result}`,
    );
  }

  @UseGuards(JwtGuard)
  @HttpCode(200)
  @Post('renew')
  renew(@CurrentUser() user: UserPublic, @Body() dto: SandboxRenewDto) {
    this.assertEnabled();
    return this.billing.forceRenewalForTesting(
      user.id,
      dto.outcome === 'decline'
        ? `${SANDBOX_DECLINE_TOKEN_PREFIX}forced`
        : null,
    );
  }
}
