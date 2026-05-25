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

  async deleteRefreshToken(token: string): Promise<void> {
    const tokenHash = this.hashToken(token);
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }

  async deleteAllUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
