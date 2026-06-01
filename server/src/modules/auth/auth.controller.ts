import { Body, Controller, Delete, Get, HttpCode, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserPublic } from '../users/types/user.types';
import { AuthResponse, TokenPair } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Post('google')
  googleLogin(@Body() dto: GoogleLoginDto): Promise<AuthResponse> {
    return this.authService.googleLogin(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto): Promise<TokenPair> {
    return this.authService.refresh(dto);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@CurrentUser() user: UserPublic): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: 'Logged out' };
  }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@CurrentUser() user: UserPublic): UserPublic {
    return user;
  }

  @UseGuards(JwtGuard)
  @Patch('me')
  updateProfile(
    @CurrentUser() user: UserPublic,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserPublic> {
    return this.authService.updateProfile(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Patch('change-password')
  @HttpCode(204)
  async changePassword(
    @CurrentUser() user: UserPublic,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, dto);
  }

  @UseGuards(JwtGuard)
  @Delete('account')
  @HttpCode(204)
  async deleteAccount(@CurrentUser() user: UserPublic): Promise<void> {
    return this.authService.deleteAccount(user.id);
  }
}
