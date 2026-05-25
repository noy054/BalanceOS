import { UserPublic } from '../../users/types/user.types';

export type JwtPayload = {
  sub: string;
  email: string;
};

export type RefreshJwtPayload = {
  sub: string;
  jti: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserPublic;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};
