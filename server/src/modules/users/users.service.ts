import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPublic } from './types/user.types';
import { UserModel } from '../../../generated/prisma/models';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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

  async updateProfile(id: string, data: { fullName?: string }): Promise<UserPublic> {
    const user = await this.usersRepository.updateProfile(id, data);
    return this.toPublic(user);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.usersRepository.updatePasswordHash(id, passwordHash);
  }

  async deleteById(id: string): Promise<void> {
    await this.usersRepository.deleteById(id);
  }

  toPublic(user: UserModel): UserPublic {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      provider: user.provider,
      googleId: user.googleId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
