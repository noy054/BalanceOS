export type Market = {
  code: string;
  offCountryTag: string;
  nameLanguages: readonly string[];
  gs1Prefixes: readonly string[];
};

export const MARKETS: readonly Market[] = [
  {
    code: 'IL',
    offCountryTag: 'en:israel',
    nameLanguages: ['he', 'ar', 'en'],
    gs1Prefixes: ['729'],
  },
  {
    code: 'US',
    offCountryTag: 'en:united-states',
    nameLanguages: ['en', 'es'],
    gs1Prefixes: [
      '00',
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
    ],
  },
  {
    code: 'GB',
    offCountryTag: 'en:united-kingdom',
    nameLanguages: ['en'],
    gs1Prefixes: ['50'],
  },
  {
    code: 'FR',
    offCountryTag: 'en:france',
    nameLanguages: ['fr'],
    gs1Prefixes: ['30', '31', '32', '33', '34', '35', '36', '37'],
  },
  {
    code: 'DE',
    offCountryTag: 'en:germany',
    nameLanguages: ['de'],
    gs1Prefixes: ['40', '41', '42', '43', '44'],
  },
];

export const DEFAULT_MARKET_CODE = 'IL';

export const MARKET_CODES = MARKETS.map((market) => market.code);

export function resolveMarket(code: string | null | undefined): Market {
  return (
    MARKETS.find((market) => market.code === code) ??
    MARKETS.find((market) => market.code === DEFAULT_MARKET_CODE)!
  );
}

export function marketForCountryTag(tag: string): Market | null {
  return MARKETS.find((market) => market.offCountryTag === tag) ?? null;
}
