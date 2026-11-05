import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RefreshTokenModel } from '../../../generated/prisma/models';
import * as crypto from 'crypto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async saveRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshTokenModel | null> {
    const tokenHash = this.hashToken(token);
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  async consumeRefreshToken(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);
    const result = await this.prisma.refreshToken.deleteMany({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    return result.count === 1;
  }

  async deleteAllUserRefreshTokens(
    userId: string,
    keepToken?: string,
  ): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        ...(keepToken ? { tokenHash: { not: this.hashToken(keepToken) } } : {}),
      },
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  async saveResetToken(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.passwordResetToken.deleteMany({ where: { userId } });
    await this.prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findResetToken(token: string) {
    const tokenHash = this.hashToken(token);
    return this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async deleteResetToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.passwordResetToken.deleteMany({ where: { tokenHash } });
  }
}
