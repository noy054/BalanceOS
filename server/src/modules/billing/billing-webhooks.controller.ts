import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CallbackHeaders } from './providers/payment-provider';

@Controller('billing/webhooks')
export class BillingWebhooksController {
  constructor(private readonly billing: BillingService) {}

  @HttpCode(200)
  @Post(':provider')
  receive(
    @Param('provider') provider: string,
    @Headers() headers: CallbackHeaders,
    @Body() body: unknown,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.billing.handleCallback(
      provider,
      headers,
      body,
      request.rawBody,
    );
  }
}
