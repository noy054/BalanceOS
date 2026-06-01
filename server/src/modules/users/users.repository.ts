import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserModel } from '../../../generated/prisma/models';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserModel> {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        passwordHash: dto.passwordHash ?? null,
        provider: dto.provider ?? 'local',
        googleId: dto.googleId ?? null,
      },
    });
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByGoogleId(googleId: string): Promise<UserModel | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async updateProfile(id: string, data: { fullName?: string }): Promise<UserModel> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
