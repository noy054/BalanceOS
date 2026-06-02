import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  fullName: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
