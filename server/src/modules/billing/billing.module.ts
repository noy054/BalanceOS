import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from '../users/users.module';
import { BillingController } from './billing.controller';
import { BillingWebhooksController } from './billing-webhooks.controller';
import { BillingSandboxController } from './billing-sandbox.controller';
import { BillingRepository } from './billing.repository';
import { BillingService } from './billing.service';
import { BillingRenewalService } from './billing-renewal.service';
import { ProAccessGuard } from './pro-access.guard';
import { PAYMENT_PROVIDER } from './providers/payment-provider';
import { PayPlusProvider } from './providers/payplus.provider';
import { SandboxPaymentProvider } from './providers/sandbox.provider';

@Module({
  imports: [
    UsersModule,
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
  ],
  controllers: [
    BillingController,
    BillingWebhooksController,
    BillingSandboxController,
  ],
  providers: [
    BillingRepository,
    BillingService,
    BillingRenewalService,
    ProAccessGuard,
    PayPlusProvider,
    SandboxPaymentProvider,
    {
      provide: PAYMENT_PROVIDER,
      inject: [ConfigService, PayPlusProvider, SandboxPaymentProvider],
      useFactory: (
        config: ConfigService,
        payplus: PayPlusProvider,
        sandbox: SandboxPaymentProvider,
      ) => {
        const choice = config.get<string>('BILLING_PROVIDER');
        if (choice === 'payplus') return payplus;
        if (choice === 'sandbox') return sandbox;
        return config.get<string>('NODE_ENV') === 'production'
          ? payplus
          : sandbox;
      },
    },
  ],
  exports: [BillingService, ProAccessGuard],
})
export class BillingModule {}
