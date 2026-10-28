import { UserRole } from '../../../../generated/prisma/enums';

export type UserPublic = {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  googleId: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
};
