import { IsIn, IsString, MaxLength } from 'class-validator';
import { BillingInterval } from '../../../../generated/prisma/client';
import {
  SANDBOX_OUTCOMES,
  SandboxOutcome,
} from '../providers/sandbox.provider';

export class ReturnUrlDto {
  @IsString()
  @MaxLength(500)
  returnUrl!: string;
}

export class CreateCheckoutDto extends ReturnUrlDto {
  @IsIn(['MONTHLY', 'YEARLY'])
  interval!: BillingInterval;
}

export class SandboxPayDto {
  @IsIn(SANDBOX_OUTCOMES)
  outcome!: SandboxOutcome;
}

export class SandboxRenewDto {
  @IsIn(['success', 'decline'])
  outcome!: 'success' | 'decline';
}
