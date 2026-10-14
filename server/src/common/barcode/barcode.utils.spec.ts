import { normalizeBarcode } from './barcode.utils';

describe('normalizeBarcode', () => {
  it('keeps a valid EAN-13 as-is', () => {
    expect(normalizeBarcode('7290000066318')).toEqual({
      canonical: '7290000066318',
      digits: '7290000066318',
    });
  });

  it('maps UPC-A, its EAN-13 form and its GTIN-14 form to the same key', () => {
    const keys = ['036000291452', '0036000291452', '00036000291452'].map(
      (code) => normalizeBarcode(code)?.canonical,
    );
    expect(new Set(keys)).toEqual(new Set(['0036000291452']));
  });

  it('pads EAN-8 to 13 digits', () => {
    expect(normalizeBarcode('96385074')?.canonical).toBe('0000096385074');
  });

  it('keeps a GTIN-14 with a packaging indicator', () => {
    expect(normalizeBarcode('17290000066315')?.canonical).toBe(
      '17290000066315',
    );
  });

  it('trims whitespace', () => {
    expect(normalizeBarcode(' 7290000066318 ')?.canonical).toBe(
      '7290000066318',
    );
  });

  it.each([
    ['bad check digit', '7290000066319'],
    ['unsupported length', '12345'],
    ['non-digits', 'abc'],
    ['path characters', '../7290000066318'],
    ['empty', ''],
  ])('rejects %s', (_label, code) => {
    expect(normalizeBarcode(code)).toBeNull();
  });

  it('returns null for null/undefined', () => {
    expect(normalizeBarcode(null)).toBeNull();
    expect(normalizeBarcode(undefined)).toBeNull();
  });
});
