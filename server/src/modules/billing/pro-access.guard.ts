import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../../../generated/prisma/enums';
import { UserPublic } from '../users/types/user.types';
import { BillingService } from './billing.service';

export const SUBSCRIPTION_REQUIRED = 'SUBSCRIPTION_REQUIRED';

@Injectable()
export class ProAccessGuard implements CanActivate {
  constructor(private readonly billing: BillingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: UserPublic }>();
    const user = request.user;
    if (!user) throw new UnauthorizedException();
    if (user.role === UserRole.ADMIN) return true;
    if (await this.billing.hasProAccess(user.id)) return true;
    throw new ForbiddenException({
      statusCode: 403,
      code: SUBSCRIPTION_REQUIRED,
      message: 'A Pro subscription is required',
    });
  }
}
