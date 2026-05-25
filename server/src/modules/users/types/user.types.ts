export type UserPublic = {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  googleId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
