import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { corsOrigins } from '../../common/http/security';
import { UserPublic } from '../users/types/user.types';
import { BillingService } from './billing.service';
import { CreateCheckoutDto, ReturnUrlDto } from './dto/billing.dto';
import { isAllowedReturnUrl } from './billing.return-url';

@UseGuards(JwtGuard, UserThrottlerGuard)
@Controller('billing')
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    private readonly config: ConfigService,
  ) {}

  private assertReturnUrl(returnUrl: string) {
    const production = this.config.get<string>('NODE_ENV') === 'production';
    const origins = corsOrigins(
      this.config.get<string>('CORS_ORIGINS'),
      production,
    );
    const allowed = isAllowedReturnUrl(returnUrl, {
      production,
      webOrigins: Array.isArray(origins) ? origins : [],
    });
    if (!allowed) {
      throw new BadRequestException('Return address is not allowed');
    }
  }

  @Get()
  status(@CurrentUser() user: UserPublic) {
    return this.billing.status(user.id);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('checkout')
  checkout(@CurrentUser() user: UserPublic, @Body() dto: CreateCheckoutDto) {
    this.assertReturnUrl(dto.returnUrl);
    return this.billing.createSubscriptionCheckout(
      user.id,
      dto.interval,
      dto.returnUrl,
    );
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('payment-method')
  paymentMethod(@CurrentUser() user: UserPublic, @Body() dto: ReturnUrlDto) {
    this.assertReturnUrl(dto.returnUrl);
    return this.billing.createPaymentMethodCheckout(user.id, dto.returnUrl);
  }

  @Get('checkouts/:id')
  checkoutStatus(@CurrentUser() user: UserPublic, @Param('id') id: string) {
    return this.billing.checkoutStatus(user.id, id);
  }

  @HttpCode(200)
  @Post('subscription/cancel')
  cancel(@CurrentUser() user: UserPublic) {
    return this.billing.cancel(user.id);
  }

  @HttpCode(200)
  @Post('subscription/resume')
  resume(@CurrentUser() user: UserPublic) {
    return this.billing.resume(user.id);
  }
}
