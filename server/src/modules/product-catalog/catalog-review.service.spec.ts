import { ConflictException } from '@nestjs/common';
import { CatalogReviewService } from './catalog-review.service';
import { CatalogReviewRepository } from './catalog-review.repository';
import { PantryProductModel } from '../../../generated/prisma/models';
import { EMPTY_NUTRITION } from '../pantry/product-nutrition.normalizer';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { normalizeBarcode } from '../../common/barcode/barcode.utils';

const catalogItem = {
  id: 'c1',
  barcode: '7290000066318',
  normalizedBarcode: '7290000066318',
  name: 'Greek yogurt',
  brand: 'Fage',
  imageUrl: 'https://img/1.png',
  nutritionBasis: 'PER_100G',
  caloriesPer100g: 57,
  proteinPer100g: 10.3,
  carbsPer100g: 3.6,
  fatPer100g: 0.2,
  fiberPer100g: null,
  caloriesPerServing: null,
  proteinPerServing: null,
  carbsPerServing: null,
  fatPerServing: null,
  fiberPerServing: null,
  servingSizeGrams: 170,
  servingSizeText: null,
  servingQuantity: null,
  servingUnit: null,
  nutrients: { sugars: 3.6 },
  originalData: null,
  source: 'OPEN_FOOD_FACTS',
  verificationStatus: 'AUTO_IMPORTED',
  externalProvider: 'open_food_facts',
  externalId: '7290000066318',
};

function product(overrides: Partial<PantryProductModel>): PantryProductModel {
  return {
    id: 'p1',
    userId: 'u1',
    name: 'Greek yogurt',
    brand: 'Fage',
    barcode: '7290000066318',
    normalizedBarcode: '7290000066318',
    catalogItemId: 'c1',
    imageUrl: 'file:///local.jpg',
    ...EMPTY_NUTRITION,
    caloriesPer100g: 57,
    proteinPer100g: 10.3,
    carbsPer100g: 3.6,
    fatPer100g: 0.2,
    servingSizeG: 170,
    nutrients: null,
    mealCategories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as PantryProductModel;
}

function setup(pending: { id: string; kind: string } | null = null) {
  const repo = {
    findCatalogItem: jest.fn().mockResolvedValue(catalogItem),
    findPendingForProduct: jest.fn().mockResolvedValue(pending),
    hasRejectedNewProduct: jest.fn().mockResolvedValue(false),
    createSubmission: jest.fn().mockResolvedValue({}),
    updateSubmission: jest.fn().mockResolvedValue({}),
    deleteSubmission: jest.fn().mockResolvedValue({}),
    findById: jest.fn(),
    findCatalogItemByBarcode: jest.fn().mockResolvedValue(null),
    approve: jest.fn(),
    reject: jest.fn(),
  };
  const service = new CatalogReviewService(
    repo as unknown as CatalogReviewRepository,
  );
  return { service, repo };
}

describe('CatalogReviewService.recordProductChange', () => {
  it('does not create a correction when the user kept the catalog values', async () => {
    const { service, repo } = setup();
    await service.recordProductChange(product({}));
    expect(repo.createSubmission).not.toHaveBeenCalled();
  });

  it('creates a correction without touching the catalog when values differ', async () => {
    const { service, repo } = setup();
    await service.recordProductChange(product({ proteinPer100g: 9 }));
    expect(repo.createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'CORRECTION', catalogItemId: 'c1' }),
    );
    expect(repo.approve).not.toHaveBeenCalled();
  });

  it('updates the existing pending submission instead of duplicating it', async () => {
    const { service, repo } = setup({ id: 's1', kind: 'CORRECTION' });
    await service.recordProductChange(product({ proteinPer100g: 9 }));
    expect(repo.updateSubmission).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ kind: 'CORRECTION' }),
    );
    expect(repo.createSubmission).not.toHaveBeenCalled();
  });

  it('withdraws a pending correction when the user reverts to catalog values', async () => {
    const { service, repo } = setup({ id: 's1', kind: 'CORRECTION' });
    await service.recordProductChange(product({}));
    expect(repo.deleteSubmission).toHaveBeenCalledWith('s1');
  });

  it('submits manual products as new catalog candidates', async () => {
    const { service, repo } = setup();
    await service.recordProductChange(
      product({ catalogItemId: null, name: 'Grandma soup' }),
    );
    expect(repo.createSubmission).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'NEW_PRODUCT', pantryProductId: 'p1' }),
    );
  });

  it('keeps barcode-less manual products private', async () => {
    const { service, repo } = setup();
    await service.recordProductChange(
      product({ catalogItemId: null, normalizedBarcode: null }),
    );
    expect(repo.createSubmission).not.toHaveBeenCalled();
  });

  it('withdraws a pending new-product submission when the barcode is removed', async () => {
    const { service, repo } = setup({ id: 's1', kind: 'NEW_PRODUCT' });
    await service.recordProductChange(
      product({ catalogItemId: null, normalizedBarcode: null }),
    );
    expect(repo.deleteSubmission).toHaveBeenCalledWith('s1');
  });

  it('does not re-queue a product an admin already rejected', async () => {
    const { service, repo } = setup();
    repo.hasRejectedNewProduct.mockResolvedValue(true);
    await service.recordProductChange(product({ catalogItemId: null }));
    expect(repo.createSubmission).not.toHaveBeenCalled();
  });
});

describe('CatalogReviewService.approve', () => {
  const pendingRow = {
    id: 's1',
    kind: 'NEW_PRODUCT',
    status: 'PENDING',
    userId: 'u1',
    pantryProductId: 'p1',
    catalogItemId: null,
    normalizedBarcode: '7290000066318',
    proposedData: {
      ...EMPTY_NUTRITION,
      name: 'Rye bread',
      brand: null,
      barcode: '7290000066318',
      imageUrl: null,
      nutritionBasis: 'PER_SERVING',
      caloriesPerServing: 160,
      proteinPerServing: 6,
      carbsPerServing: 30,
      fatPerServing: 2,
      servingQuantity: 2,
      servingUnit: 'slices',
      nutrients: null,
    },
    user: { id: 'u1', email: 'a@b.c', fullName: 'A' },
    reviewedBy: null,
    catalogItem: null,
    reviewNote: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('merges into an existing catalog item with the same barcode instead of duplicating', async () => {
    const { service, repo } = setup();
    repo.findById.mockResolvedValue(pendingRow);
    repo.findCatalogItemByBarcode.mockResolvedValue(catalogItem);
    repo.approve.mockResolvedValue({ ...pendingRow, status: 'APPROVED' });
    await service.approve('admin', 's1', {
      name: 'Rye bread',
      nutritionBasis: 'PER_SERVING',
      caloriesPerServing: 150,
    });
    expect(repo.approve).toHaveBeenCalledWith(
      expect.objectContaining({
        targetCatalogItemId: 'c1',
        normalizedBarcode: null,
        data: expect.objectContaining({
          caloriesPerServing: 150,
          servingUnit: 'slices',
        }),
      }),
    );
  });

  it('refuses to review the same submission twice', async () => {
    const { service, repo } = setup();
    repo.findById.mockResolvedValue({ ...pendingRow, status: 'APPROVED' });
    await expect(
      service.approve('admin', 's1', { name: 'Rye bread' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('refuses when a concurrent review claimed the submission first', async () => {
    const { service, repo } = setup();
    repo.findById.mockResolvedValue(pendingRow);
    repo.approve.mockResolvedValue(null);
    await expect(
      service.approve('admin', 's1', { name: 'Rye bread' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

describe('OpenFoodFactsClient', () => {
  it('keeps every per-100g nutrient and leaves unknown values null', async () => {
    const client = new OpenFoodFactsClient();
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      status: 200,
      ok: true,
      json: () =>
        Promise.resolve({
          status: 1,
          product: {
            product_name: 'Cookies',
            serving_quantity: '25',
            serving_size: '2 cookies (25 g)',
            nutriments: {
              'energy-kcal_100g': 480,
              proteins_100g: 6,
              carbohydrates_100g: 65,
              fat_100g: 21,
              sugars_100g: 30,
              'saturated-fat_100g': 9,
              salt_100g: '0.8',
              'vitamin-c_100g': 0.002,
            },
          },
        }),
    } as unknown as Response);

    const result = await client.fetchByBarcode(
      normalizeBarcode('7290000066318')!,
    );
    fetchMock.mockRestore();

    expect(result.status).toBe('found');
    if (result.status !== 'found') return;
    expect(result.data.fiberPer100g).toBeNull();
    expect(result.data.sugarPer100g).toBe(30);
    expect(result.data.saltPer100g).toBe(0.8);
    expect(result.data.sodiumPer100g).toBeNull();
    expect(result.data.servingSizeGrams).toBe(25);
    expect(result.data.nutrients).toEqual(
      expect.objectContaining({ 'vitamin-c': 0.002, 'saturated-fat': 9 }),
    );
  });
});
