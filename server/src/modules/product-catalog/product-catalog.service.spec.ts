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
