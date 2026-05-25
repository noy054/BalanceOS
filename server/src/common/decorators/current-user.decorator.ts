import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPublic } from '../../modules/users/types/user.types';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserPublic => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
