import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';
import { AuthResponse, TokenPair } from './types/auth.types';
import { UserPublic } from '../users/types/user.types';

const BCRYPT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES_SECONDS = 15 * 60; // 15 minutes
const REFRESH_TOKEN_EXPIRES_SECONDS = 7 * 24 * 60 * 60; // 7 days
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly usersService: UsersService,
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private getGoogleClient(): OAuth2Client {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId || clientId.startsWith('replace-')) {
      throw new BadRequestException(
        'Google login is not configured on this server.',
      );
    }
    if (!this.googleClient) {
      this.googleClient = new OAuth2Client(clientId);
    }
    return this.googleClient;
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      provider: 'local',
    });

    const tokens = await this.issueTokenPair(user.id);
    return { ...tokens, user: this.usersService.toPublic(user) };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokenPair(user.id);
    return { ...tokens, user: this.usersService.toPublic(user) };
  }

  async googleLogin(dto: GoogleLoginDto): Promise<AuthResponse> {
    const client = this.getGoogleClient();
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;

    const ticket = await client
      .verifyIdToken({ idToken: dto.idToken, audience: clientId })
      .catch(() => {
        throw new UnauthorizedException('Invalid Google token');
      });

    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token payload');
    }

    let user = await this.usersService.findByGoogleId(payload.sub);

    if (!user) {
      user = await this.usersService.findByEmail(payload.email);
      if (user) {
        throw new BadRequestException(
          'An account with this email already exists. Please log in with email and password.',
        );
      }

      user = await this.usersService.create({
        email: payload.email,
        fullName: payload.name ?? payload.email,
        provider: 'google',
        googleId: payload.sub,
      });
    }

    const tokens = await this.issueTokenPair(user.id);
    return { ...tokens, user: this.usersService.toPublic(user) };
  }

  async refresh(dto: RefreshDto): Promise<TokenPair> {
    try {
      this.jwtService.verify(dto.refreshToken, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const stored = await this.authRepository.findRefreshToken(dto.refreshToken);
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.authRepository.deleteRefreshToken(dto.refreshToken);
    return this.issueTokenPair(stored.userId);
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.deleteAllUserRefreshTokens(userId);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserPublic> {
    if (!dto.fullName) {
      return this.usersService.getPublicUser(userId);
    }
    return this.usersService.updateProfile(userId, { fullName: dto.fullName });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();
    if (!user.passwordHash) {
      throw new BadRequestException('Password change is not available for this account type.');
    }
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect.');
    const newHash = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);
    await this.usersService.updatePasswordHash(userId, newHash);
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersService.deleteById(userId);
  }

  private async issueTokenPair(userId: string): Promise<TokenPair> {
    void this.authRepository.deleteExpiredTokens();

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException();

    const accessToken = this.jwtService.sign(
      { sub: userId, email: user.email },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: ACCESS_TOKEN_EXPIRES_SECONDS,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRES_SECONDS,
      },
    );

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);

    await this.authRepository.saveRefreshToken(
      userId,
      refreshToken,
      refreshExpiresAt,
    );

    return { accessToken, refreshToken };
  }
}
