export class CreateUserDto {
  email: string;
  fullName: string;
  passwordHash?: string;
  provider?: string;
  googleId?: string;
}
