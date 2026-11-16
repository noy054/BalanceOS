import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UserRole } from '../../../generated/prisma/enums';
import { UserPublic } from '../../modules/users/types/user.types';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ user?: UserPublic }>();
    const userId = request.user?.id;
    const current = userId ? await this.usersService.findById(userId) : null;
    if (current?.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
