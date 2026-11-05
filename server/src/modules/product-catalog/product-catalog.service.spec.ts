import { BadRequestException } from '@nestjs/common';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCatalogRepository } from './product-catalog.repository';
import { OpenFoodFactsClient } from './open-food-facts.client';
import { UsdaFoodDataCentralClient } from './usda-food-data-central.client';
import { ExternalLookupResult } from './types/external-product.types';
import { normalizeBarcode } from '../../common/barcode/barcode.utils';

const BARCODE = normalizeBarcode('7290000066318')!;

function setup(options: {
  off: ExternalLookupResult;
  usdaConfigured: boolean;
  usda?: ExternalLookupResult;
}) {
  const repo = {
    findByNormalizedBarcode: jest.fn().mockResolvedValue(null),
    isArchivedBarcode: jest.fn().mockResolvedValue(false),
    findMiss: jest.fn().mockResolvedValue(null),
    recordMiss: jest.fn().mockResolvedValue(undefined),
    clearMiss: jest.fn().mockResolvedValue(undefined),
    createFromExternal: jest.fn(),
  };
  const off = { fetchByBarcode: jest.fn().mockResolvedValue(options.off) };
  const usda = {
    isConfigured: jest.fn().mockReturnValue(options.usdaConfigured),
    fetchByBarcode: jest
      .fn()
      .mockResolvedValue(options.usda ?? { status: 'not_found' }),
  };
  const service = new ProductCatalogService(
    repo as unknown as ProductCatalogRepository,
    off as unknown as OpenFoodFactsClient,
    usda as unknown as UsdaFoodDataCentralClient,
  );
  return { service, repo, off, usda };
}

describe('ProductCatalogService.lookupByBarcode', () => {
  it('caches a miss when USDA is not configured and OFF does not know the barcode', async () => {
    const { service, repo, usda } = setup({
      off: { status: 'not_found' },
      usdaConfigured: false,
    });

    await expect(service.lookupByBarcode('u1', BARCODE)).resolves.toBeNull();
    expect(usda.fetchByBarcode).not.toHaveBeenCalled();
    expect(repo.recordMiss).toHaveBeenCalledWith(BARCODE.canonical);
  });

  it('does not cache a miss when a provider fails', async () => {
    const { service, repo } = setup({
      off: { status: 'error' },
      usdaConfigured: true,
    });

    await expect(service.lookupByBarcode('u1', BARCODE)).resolves.toBeNull();
    expect(repo.recordMiss).not.toHaveBeenCalled();
  });

  it('skips external providers while a miss is fresh', async () => {
    const { service, repo, off } = setup({
      off: { status: 'not_found' },
      usdaConfigured: false,
    });
    repo.findMiss.mockResolvedValue({ lastCheckedAt: new Date() });

    await expect(service.lookupByBarcode('u1', BARCODE)).resolves.toBeNull();
    expect(off.fetchByBarcode).not.toHaveBeenCalled();
  });
});

describe('ProductCatalogService catalog-first lookup and browsing', () => {
  function browseSetup() {
    const repo = {
      findByNormalizedBarcode: jest.fn(),
      countByDepartment: jest.fn(),
      countBySubcategory: jest.fn(),
      browse: jest.fn(),
      findPantryMatches: jest.fn(),
    };
    const off = { fetchByBarcode: jest.fn() };
    const usda = { isConfigured: jest.fn(), fetchByBarcode: jest.fn() };
    const service = new ProductCatalogService(
      repo as unknown as ProductCatalogRepository,
      off as unknown as OpenFoodFactsClient,
      usda as unknown as UsdaFoodDataCentralClient,
    );
    return { service, repo, off, usda };
  }

  it('returns a catalog product without calling external sources', async () => {
    const { service, repo, off, usda } = browseSetup();
    repo.findByNormalizedBarcode.mockResolvedValue({ id: 'c1' });

    await expect(service.lookupByBarcode('u1', BARCODE)).resolves.toEqual({
      id: 'c1',
    });
    expect(off.fetchByBarcode).not.toHaveBeenCalled();
    expect(usda.fetchByBarcode).not.toHaveBeenCalled();
  });

  it('lists only departments that have products, in shelf order', async () => {
    const { service, repo } = browseSetup();
    repo.countByDepartment.mockResolvedValue(
      new Map([
        ['BEVERAGES', 3],
        ['DAIRY_EGGS', 5],
        ['OTHER', 0],
      ]),
    );

    await expect(service.departments()).resolves.toEqual([
      { department: 'DAIRY_EGGS', count: 5 },
      { department: 'BEVERAGES', count: 3 },
    ]);
  });

  it('lists only subcategories that have products', async () => {
    const { service, repo } = browseSetup();
    repo.countBySubcategory.mockResolvedValue(
      new Map([
        ['YOGURT', 4],
        ['EGGS', 2],
        ['BUTTER_CREAM', 1],
      ]),
    );

    await expect(service.subcategories('DAIRY_EGGS')).resolves.toEqual([
      { key: 'YOGURT', count: 4 },
      { key: 'EGGS', count: 2 },
      { key: 'BUTTER_CREAM', count: 1 },
    ]);
  });

  it('filters browsing by a subcategory of the department', async () => {
    const { service, repo } = browseSetup();
    repo.browse.mockResolvedValue([]);
    repo.findPantryMatches.mockResolvedValue([]);

    await service.browse('u1', {
      department: 'DAIRY_EGGS',
      subcategory: 'EGGS',
      limit: 20,
    });

    expect(repo.browse).toHaveBeenCalledWith(
      expect.objectContaining({
        department: 'DAIRY_EGGS',
        subcategory: 'EGGS',
      }),
    );
  });

  it('rejects a subcategory outside the department', async () => {
    const { service, repo } = browseSetup();

    await expect(
      service.browse('u1', { department: 'BEVERAGES', subcategory: 'EGGS' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.browse('u1', { subcategory: 'EGGS' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(repo.browse).not.toHaveBeenCalled();
  });

  it('marks products that are already in the pantry', async () => {
    const { service, repo } = browseSetup();
    repo.browse.mockResolvedValue([
      { id: 'c1', normalizedBarcode: '0000000000001' },
      { id: 'c2', normalizedBarcode: '0000000000002' },
      { id: 'c3', normalizedBarcode: null },
    ]);
    repo.findPantryMatches.mockResolvedValue([
      { id: 'p1', catalogItemId: 'c1', normalizedBarcode: null },
      { id: 'p2', catalogItemId: null, normalizedBarcode: '0000000000002' },
    ]);

    const page = await service.browse('u1', {
      department: 'DAIRY_EGGS',
      q: '  yogurt ',
      limit: 20,
    });

    expect(repo.browse).toHaveBeenCalledWith({
      department: 'DAIRY_EGGS',
      query: 'yogurt',
      take: 21,
      cursor: undefined,
    });
    expect(repo.findPantryMatches).toHaveBeenCalledWith(
      'u1',
      ['c1', 'c2', 'c3'],
      ['0000000000001', '0000000000002'],
    );
    expect(page.items.map((item) => item.pantryProductId)).toEqual([
      'p1',
      'p2',
      null,
    ]);
    expect(page.nextCursor).toBeNull();
  });
});
