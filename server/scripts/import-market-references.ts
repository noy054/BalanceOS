import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { PrismaClient, Prisma } from '../generated/prisma/client';
import { normalizeBarcode } from '../src/common/barcode/barcode.utils';
import { MARKET_CODES } from '../src/common/market/markets';

type Reference = {
  normalizedBarcode: string;
  name: string;
  brand: string | null;
  packageQuantity: number | null;
  packageUnit: string | null;
  originCountry: string | null;
};

type Adapter = (text: string) => Reference[];

const args = process.argv.slice(2);

function option(name: string): string | undefined {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
}

function field(block: string, key: string): string {
  const start = block.indexOf(`<${key}>`);
  if (start < 0) return '';
  const end = block.indexOf(`</${key}>`, start);
  return end < 0 ? '' : block.slice(start + key.length + 2, end).trim();
}

const LEGAL_SUFFIXES = [
  /\s*בע"מ\.?\s*$/,
  /\s*בעמ\.?\s*$/,
  /\s*אגש"ח\.?\s*$/,
  /\s*ltd\.?\s*$/i,
  /\s*inc\.?\s*$/i,
];
const UNKNOWN_MAKERS = new Set(['', 'כללי', 'לא ידוע', 'unknown', 'general']);

function cleanText(value: string): string {
  return value.replaceAll('\\', '').replace(/\s+/g, ' ').trim();
}

function cleanBrand(value: string): string | null {
  let brand = cleanText(value);
  for (const suffix of LEGAL_SUFFIXES) brand = brand.replace(suffix, '');
  if (!/[\p{L}\p{N}]/u.test(brand)) return null;
  return UNKNOWN_MAKERS.has(brand.toLowerCase()) ? null : brand;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

const ADAPTERS: Record<string, Adapter> = {
  'price-transparency-xml': (text) => {
    const references: Reference[] = [];
    let position = 0;
    while (true) {
      const start = text.indexOf('<Item>', position);
      if (start < 0) break;
      const end = text.indexOf('</Item>', start);
      if (end < 0) break;
      const block = text.slice(start, end);
      position = end + 7;
      if (field(block, 'bIsWeighted') === '1') continue;
      const barcode = normalizeBarcode(field(block, 'ItemCode'));
      const name = cleanText(decodeEntities(field(block, 'ItemName')));
      if (!barcode || !name) continue;
      const quantity = Number(field(block, 'Quantity'));
      references.push({
        normalizedBarcode: barcode.canonical,
        name,
        brand: cleanBrand(decodeEntities(field(block, 'ManufactureName'))),
        packageQuantity:
          Number.isFinite(quantity) && quantity > 0 ? quantity : null,
        packageUnit: field(block, 'UnitQty') || null,
        originCountry: field(block, 'ManufactureCountry').toUpperCase() || null,
      });
    }
    return references;
  },
};

async function readSource(path: string): Promise<string> {
  const buffer = await readFile(path);
  const raw =
    buffer[0] === 0x1f && buffer[1] === 0x8b ? gunzipSync(buffer) : buffer;
  return raw.toString('utf8').replace(/^﻿/, '');
}

async function main() {
  const market = option('--market');
  const format = option('--format') ?? 'price-transparency-xml';
  const source = option('--source') ?? format;
  const files = args.filter((arg, index) => args[index - 1] === '--file');

  if (!market || !MARKET_CODES.includes(market)) {
    throw new Error(`--market must be one of ${MARKET_CODES.join(', ')}`);
  }
  const adapter = ADAPTERS[format];
  if (!adapter) {
    throw new Error(
      `--format must be one of ${Object.keys(ADAPTERS).join(', ')}`,
    );
  }
  if (files.length === 0) throw new Error('Provide at least one --file');

  const byBarcode = new Map<string, Reference>();
  for (const file of files) {
    for (const reference of adapter(await readSource(file))) {
      if (!byBarcode.has(reference.normalizedBarcode)) {
        byBarcode.set(reference.normalizedBarcode, reference);
      }
    }
  }
  const references = [...byBarcode.values()];

  if (!args.includes('--apply')) {
    console.log({
      mode: 'DRY_RUN',
      market,
      source,
      references: references.length,
      sample: references.slice(0, 3),
    });
    return;
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing');

  const prisma = new PrismaClient();
  try {
    let written = 0;
    for (let offset = 0; offset < references.length; offset += 500) {
      const batch = references.slice(offset, offset + 500);
      const rows = batch.map(
        (reference) =>
          Prisma.sql`(${market}, ${reference.normalizedBarcode}, ${reference.name}, ${reference.brand}, ${reference.packageQuantity}, ${reference.packageUnit}, ${reference.originCountry}, ${source}, now(), now())`,
      );
      written += await prisma.$executeRaw`
        INSERT INTO "MarketProductReference"
          ("marketCode", "normalizedBarcode", "name", "brand", "packageQuantity", "packageUnit", "originCountry", "source", "createdAt", "updatedAt")
        VALUES ${Prisma.join(rows)}
        ON CONFLICT ("marketCode", "normalizedBarcode") DO UPDATE SET
          "name" = EXCLUDED."name",
          "brand" = EXCLUDED."brand",
          "packageQuantity" = EXCLUDED."packageQuantity",
          "packageUnit" = EXCLUDED."packageUnit",
          "originCountry" = EXCLUDED."originCountry",
          "source" = EXCLUDED."source",
          "updatedAt" = now()
      `;
    }
    console.log({
      mode: 'APPLIED',
      market,
      source,
      references: references.length,
      written,
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
