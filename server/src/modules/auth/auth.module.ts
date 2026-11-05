import { Module } from '@nestjs/common';
import { FoodImagesModule } from '../food-images/food-images.module';
import { ProgressModule } from '../progress/progress.module';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { MailerService } from './mailer.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    ProgressModule,
    FoodImagesModule,
    PassportModule,
    JwtModule.register({}),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 30 }]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, MailerService, JwtStrategy],
})
export class AuthModule {}
