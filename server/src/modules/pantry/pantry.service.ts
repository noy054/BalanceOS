import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PantryRepository } from './pantry.repository';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { PantryProductModel } from '../../../generated/prisma/models';

@Injectable()
export class PantryService {
  constructor(private readonly repo: PantryRepository) {}

  list(userId: string, search?: string): Promise<PantryProductModel[]> {
    return this.repo.findAllByUserId(userId, search);
  }

  async getById(userId: string, id: string): Promise<PantryProductModel> {
    const product = await this.repo.findByIdAndUserId(id, userId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getByBarcode(userId: string, barcode: string): Promise<PantryProductModel> {
    const product = await this.repo.findByBarcodeAndUserId(barcode, userId);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(
    userId: string,
    dto: CreatePantryProductDto,
  ): Promise<PantryProductModel> {
    if (dto.barcode) {
      const existing = await this.repo.findByBarcodeAndUserId(dto.barcode, userId);
      if (existing) {
        throw new ConflictException(
          'A product with this barcode already exists in your pantry',
        );
      }
    }
    return this.repo.create(userId, dto);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdatePantryProductDto,
  ): Promise<PantryProductModel> {
    await this.getById(userId, id);
    if (dto.barcode) {
      const existing = await this.repo.findByBarcodeAndUserId(dto.barcode, userId);
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'A product with this barcode already exists in your pantry',
        );
      }
    }
    return this.repo.update(id, dto);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.getById(userId, id);
    await this.repo.delete(id);
  }
}
