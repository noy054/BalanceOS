import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePantryProductDto } from './dto/create-pantry-product.dto';
import { UpdatePantryProductDto } from './dto/update-pantry-product.dto';
import { PantryProductModel } from '../../../generated/prisma/models';

@Injectable()
export class PantryRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByUserId(userId: string, search?: string): Promise<PantryProductModel[]> {
    return this.prisma.pantryProduct.findMany({
      where: {
        userId,
        ...(search
          ? { name: { contains: search, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  findByIdAndUserId(id: string, userId: string): Promise<PantryProductModel | null> {
    return this.prisma.pantryProduct.findFirst({ where: { id, userId } });
  }

  findByBarcodeAndUserId(barcode: string, userId: string): Promise<PantryProductModel | null> {
    return this.prisma.pantryProduct.findFirst({ where: { barcode, userId } });
  }

  create(userId: string, dto: CreatePantryProductDto): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.create({ data: { userId, ...dto } });
  }

  update(id: string, dto: UpdatePantryProductDto): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.update({ where: { id }, data: dto });
  }

  delete(id: string): Promise<PantryProductModel> {
    return this.prisma.pantryProduct.delete({ where: { id } });
  }
}
