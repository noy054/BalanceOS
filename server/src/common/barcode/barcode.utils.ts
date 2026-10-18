const SUPPORTED_LENGTHS = new Set([8, 12, 13, 14]);

export interface NormalizedBarcode {
  canonical: string;
  digits: string;
}

export function isValidGtinCheckDigit(digits: string): boolean {
  let sum = 0;
  for (
    let i = digits.length - 2, weight = 3;
    i >= 0;
    i--, weight = 4 - weight
  ) {
    sum += Number(digits[i]) * weight;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[digits.length - 1]);
}

export function normalizeBarcode(
  raw: string | null | undefined,
): NormalizedBarcode | null {
  if (raw == null) return null;
  const digits = raw.trim();
  if (!/^\d+$/.test(digits) || !SUPPORTED_LENGTHS.has(digits.length))
    return null;
  if (!isValidGtinCheckDigit(digits)) return null;

  let canonical: string;
  if (digits.length === 14) {
    canonical = digits.startsWith('0') ? digits.slice(1) : digits;
  } else {
    canonical = digits.padStart(13, '0');
  }
  return { canonical, digits };
}
