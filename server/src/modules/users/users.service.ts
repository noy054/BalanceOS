import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPublic } from './types/user.types';
import { UserModel } from '../../../generated/prisma/models';

const AUTH_CACHE_TTL_MS = 10_000;
const AUTH_CACHE_MAX_ENTRIES = 5_000;

@Injectable()
export class UsersService {
  private readonly authCache = new Map<
    string,
    { user: UserPublic; expiresAt: number }
  >();

  constructor(private readonly usersRepository: UsersRepository) {}

  async getAuthUser(id: string): Promise<UserPublic | null> {
    const now = Date.now();
    const cached = this.authCache.get(id);
    if (cached && cached.expiresAt > now) return cached.user;
    const user = await this.usersRepository.findById(id);
    if (!user) {
      this.authCache.delete(id);
      return null;
    }
    const publicUser = this.toPublic(user);
    if (this.authCache.size >= AUTH_CACHE_MAX_ENTRIES) {
      const oldest = this.authCache.keys().next().value;
      if (oldest !== undefined) this.authCache.delete(oldest);
    }
    this.authCache.set(id, {
      user: publicUser,
      expiresAt: now + AUTH_CACHE_TTL_MS,
    });
    return publicUser;
  }

  forgetAuthUser(id: string): void {
    this.authCache.delete(id);
  }

  async create(dto: CreateUserDto): Promise<UserModel> {
    return this.usersRepository.create(dto);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserModel | null> {
    return this.usersRepository.findById(id);
  }

  async findByGoogleId(googleId: string): Promise<UserModel | null> {
    return this.usersRepository.findByGoogleId(googleId);
  }

  async getPublicUser(id: string): Promise<UserPublic> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async updateProfile(
    id: string,
    data: { fullName?: string },
  ): Promise<UserPublic> {
    const user = await this.usersRepository.updateProfile(id, data);
    this.forgetAuthUser(id);
    return this.toPublic(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.updatePasswordHash(id, passwordHash);
    this.forgetAuthUser(id);
  }

  async deleteById(id: string): Promise<void> {
    this.forgetAuthUser(id);
    await this.usersRepository.deleteById(id);
    this.forgetAuthUser(id);
  }

  toPublic(user: UserModel): UserPublic {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      provider: user.provider,
      googleId: user.googleId,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
