export type UserPublic = {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPayload = {
  email: string;
  fullName: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type GoogleLoginPayload = {
  idToken: string;
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
