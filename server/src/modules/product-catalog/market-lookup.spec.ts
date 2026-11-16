import { OpenFoodFactsClient } from './open-food-facts.client';
import { ProductCatalogService } from './product-catalog.service';
import { ProductCatalogRepository } from './product-catalog.repository';
import { UsdaFoodDataCentralClient } from './usda-food-data-central.client';
import {
  gtinVariants,
  normalizeBarcode,
} from '../../common/barcode/barcode.utils';
import { lookupContext } from '../../common/market/lookup-context';
import { BarcodeService } from '../barcode/barcode.service';
import { PantryService } from '../pantry/pantry.service';

function response(status: number, body?: object) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

const product = {
  product_name: 'Hummus',
  product_name_he: 'חומוס',
  product_name_fr: 'Houmous',
  lang: 'fr',
  countries_tags: ['en:france', 'en:israel'],
  nutriments: { 'energy-kcal_100g': 250 },
};

describe('gtinVariants', () => {
  it('pairs UPC-A and EAN-13 forms and keeps a plain EAN-13 to one request', () => {
    expect(gtinVariants(normalizeBarcode('012345678905')!)).toEqual([
      '012345678905',
      '0012345678905',
    ]);
    expect(gtinVariants(normalizeBarcode('0012345678905')!)).toEqual([
      '0012345678905',
      '012345678905',
    ]);
    expect(gtinVariants(normalizeBarcode('7290000066318')!)).toEqual([
      '7290000066318',
    ]);
  });
});

describe('OpenFoodFactsClient market lookup', () => {
  afterEach(() => jest.restoreAllMocks());

  it('tries the equivalent code forms until one is found', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(response(404))
      .mockResolvedValueOnce(response(200, { status: 1, product }));
    const result = await new OpenFoodFactsClient().fetchByBarcode(
      normalizeBarcode('012345678905')!,
    );
    expect(result.status).toBe('found');
    expect(fetchMock.mock.calls.map(([url]) => String(url))).toEqual([
      expect.stringContaining('/012345678905.json'),
      expect.stringContaining('/0012345678905.json'),
    ]);
  });

  it('stops at a rate limit instead of reporting a miss', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(response(429));
    const result = await new OpenFoodFactsClient().fetchByBarcode(
      normalizeBarcode('012345678905')!,
    );
    expect(result.status).toBe('error');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('names and tags the product for the user market, not a fixed language', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(response(200, { status: 1, product }));
    const client = new OpenFoodFactsClient();
    const barcode = normalizeBarcode('7290000066318')!;

    const israel = await client.fetchByBarcode(barcode, lookupContext('IL'));
    const france = await client.fetchByBarcode(barcode, lookupContext('FR'));
    const us = await client.fetchByBarcode(barcode, lookupContext('US', 'en'));

    if (
      israel.status !== 'found' ||
      france.status !== 'found' ||
      us.status !== 'found'
    )
      throw new Error('expected matches');
    expect([
      israel.data.name,
      israel.data.languageCode,
      israel.data.countryCode,
    ]).toEqual(['חומוס', 'he', 'IL']);
    expect([
      france.data.name,
      france.data.languageCode,
      france.data.countryCode,
    ]).toEqual(['Houmous', 'fr', 'FR']);
    expect([us.data.name, us.data.languageCode, us.data.countryCode]).toEqual([
      'Hummus',
      'fr',
      'FR',
    ]);
  });
});

describe('ProductCatalogService provider order', () => {
  it('asks the provider that covers the user market first', async () => {
    const calls: string[] = [];
    const repo = {
      findByNormalizedBarcode: jest.fn().mockResolvedValue(null),
      isArchivedBarcode: jest.fn().mockResolvedValue(false),
      findMiss: jest.fn().mockResolvedValue(null),
      recordMiss: jest.fn().mockResolvedValue(undefined),
    };
    const off = {
      fetchByBarcode: jest.fn(() => {
        calls.push('off');
        return Promise.resolve({ status: 'not_found' });
      }),
    };
    const usda = {
      isConfigured: () => true,
      fetchByBarcode: jest.fn(() => {
        calls.push('usda');
        return Promise.resolve({ status: 'not_found' });
      }),
    };
    const service = new ProductCatalogService(
      repo as unknown as ProductCatalogRepository,
      off as unknown as OpenFoodFactsClient,
      usda as unknown as UsdaFoodDataCentralClient,
    );
    const barcode = normalizeBarcode('012345678905')!;
    await service.lookupByBarcode('u1', barcode, lookupContext('US'));
    repo.findMiss.mockResolvedValue(null);
    await service.lookupByBarcode('u1', barcode, lookupContext('IL'));
    expect(calls).toEqual(['usda', 'off', 'off', 'usda']);
  });
});

describe('BarcodeService market reference fallback', () => {
  function setup(reference: object | null) {
    const pantry = { findByBarcode: jest.fn().mockResolvedValue(null) };
    const catalog = {
      lookupContextFor: jest.fn().mockResolvedValue(lookupContext('IL', 'he')),
      lookupByBarcode: jest.fn().mockResolvedValue(null),
      findMarketReference: jest.fn().mockResolvedValue(reference),
    };
    return {
      service: new BarcodeService(
        pantry as unknown as PantryService,
        catalog as unknown as ProductCatalogService,
      ),
      catalog,
    };
  }

  it('identifies an unmatched product from the market reference so it can be prefilled', async () => {
    const reference = {
      marketCode: 'IL',
      name: 'סילאן אורגני 900 גרם',
      brand: 'גרין',
      packageQuantity: 900,
      packageUnit: 'גרם',
      originCountry: 'AE',
    };
    const { service, catalog } = setup(reference);
    const barcode = normalizeBarcode('7296073497813')!;
    await expect(service.resolve('u1', barcode)).resolves.toEqual({
      status: 'NOT_FOUND',
      barcode: barcode.canonical,
      reference,
    });
    expect(catalog.lookupByBarcode).toHaveBeenCalledWith(
      'u1',
      barcode,
      expect.objectContaining({
        market: expect.objectContaining({ code: 'IL' }),
      }),
    );
  });

  it('reports a plain miss when no market knows the barcode', async () => {
    const { service } = setup(null);
    const barcode = normalizeBarcode('7296073497813')!;
    await expect(service.resolve('u1', barcode)).resolves.toEqual({
      status: 'NOT_FOUND',
      barcode: barcode.canonical,
    });
  });
});

describe('ProductCatalogService empty provider records', () => {
  const stub = {
    barcode: '7290018724323',
    normalizedBarcode: '7290018724323',
    name: '7290018724323',
    nameMissing: true,
    brand: null,
    imageUrl: null,
    caloriesPer100g: null,
    proteinPer100g: null,
    carbsPer100g: null,
    fatPer100g: null,
    fiberPer100g: null,
    source: 'OPEN_FOOD_FACTS',
    verificationStatus: 'AUTO_IMPORTED',
    externalProvider: 'open_food_facts',
    externalId: '7290018724323',
    externalRawData: {},
  };

  function setup(data: object, reference: object | null) {
    const repo = {
      findByNormalizedBarcode: jest.fn().mockResolvedValue(null),
      isArchivedBarcode: jest.fn().mockResolvedValue(false),
      findMiss: jest.fn().mockResolvedValue(null),
      recordMiss: jest.fn().mockResolvedValue(undefined),
      clearMiss: jest.fn().mockResolvedValue(undefined),
      findMarketReference: jest.fn().mockResolvedValue(reference),
      createFromExternal: jest.fn((saved: object) => Promise.resolve(saved)),
    };
    const off = {
      fetchByBarcode: jest.fn().mockResolvedValue({ status: 'found', data }),
    };
    const usda = { isConfigured: () => false, fetchByBarcode: jest.fn() };
    const service = new ProductCatalogService(
      repo as unknown as ProductCatalogRepository,
      off as unknown as OpenFoodFactsClient,
      usda as unknown as UsdaFoodDataCentralClient,
    );
    return { service, repo };
  }

  it('does not save a record that has neither a name nor nutrition', async () => {
    const { service, repo } = setup(stub, null);
    await expect(
      service.lookupByBarcode('u1', normalizeBarcode('7290018724323')!),
    ).resolves.toBeNull();
    expect(repo.createFromExternal).not.toHaveBeenCalled();
    expect(repo.recordMiss).toHaveBeenCalledWith('7290018724323');
  });

  it('names a record that has nutrition but no name from the market reference', async () => {
    const { service, repo } = setup(
      { ...stub, caloriesPer100g: 120 },
      { name: 'מלח הימלאיה דק 1 ק"ג', brand: 'מלח הארץ' },
    );
    await service.lookupByBarcode('u1', normalizeBarcode('7290018724323')!);
    expect(repo.createFromExternal).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'מלח הימלאיה דק 1 ק"ג',
        brand: 'מלח הארץ',
        caloriesPer100g: 120,
      }),
      'u1',
    );
  });
});
