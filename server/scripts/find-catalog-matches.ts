import { createReadStream } from 'node:fs';
import {
  access,
  mkdir,
  readFile,
  rename,
  stat,
  writeFile,
} from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

type Data = Record<string, unknown>;

type SearchName = {
  value: string;
  normalized: string;
  tokens: Set<string>;
};

type Target = {
  id: string;
  name: string;
  aliases: SearchName[];
};

type Candidate = {
  barcode: string;
  normalizedBarcode: string;
  name: string;
  brand: string | null;
  quantity: string | null;
  imageUrl: string | null;
  nutritionImageUrl: string | null;
  productUrl: string;
  matchScore: number;
  matchedOn: string;
  reviewRequired: true;
  nutrition: Data;
};

const ignoredWords = new Set([
  'עם',
  'של',
  'את',
  'and',
  'with',
  'the',
  'a',
  'an',
]);

function object(value: unknown): Data {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Data)
    : {};
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function normalize(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function searchName(value: string): SearchName {
  const normalized = normalize(value);

  return {
    value,
    normalized,
    tokens: new Set(
      normalized
        .split(/\s+/)
        .filter((token) => token && !ignoredWords.has(token)),
    ),
  };
}

function similarity(target: SearchName, candidate: SearchName): number {
  if (!target.normalized || !candidate.normalized) {
    return 0;
  }

  if (target.normalized === candidate.normalized) {
    return 1;
  }

  let matched = 0;

  for (const token of target.tokens) {
    if (candidate.tokens.has(token)) {
      matched += 1;
    }
  }

  if (target.tokens.size === 1) {
    return matched === 1 ? 0.7 : 0;
  }

  if (matched < 2) {
    return 0;
  }

  return (
    (matched / target.tokens.size) * 0.8 +
    (matched / Math.max(candidate.tokens.size, 1)) * 0.2
  );
}

function normalizeBarcode(value: unknown): string | null {
  const code = text(value);

  if (!code || !/^(?:\d{8}|\d{12}|\d{13})$/.test(code)) {
    return null;
  }

  const sum = code
    .slice(0, -1)
    .split('')
    .reverse()
    .reduce(
      (total, digit, index) =>
        total + Number(digit) * (index % 2 === 0 ? 3 : 1),
      0,
    );

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === Number(code[code.length - 1])
    ? code.padStart(13, '0')
    : null;
}

function imageUrl(product: Data, type: 'front' | 'nutrition'): string | null {
  const selectedImages = object(product.selected_images);
  const display = object(object(selectedImages[type]).display);

  const directCandidates = [
    display.he,
    display.iw,
    display[text(product.lang) ?? 'en'],
    display.en,
    product[`image_${type}_url`],
    ...(type === 'front' ? [product.image_url] : []),
  ];

  for (const candidate of directCandidates) {
    const value = text(candidate);

    if (!value) {
      continue;
    }

    try {
      if (new URL(value).protocol === 'https:') {
        return value;
      }
    } catch {
      continue;
    }
  }

  const code = text(product.code);

  if (!code || !/^\d{13}$/.test(code)) {
    return null;
  }

  const images = object(product.images);
  const nested = object(object(images.selected)[type]);

  const languages = [
    ...new Set([
      'he',
      'iw',
      text(product.lang) ?? 'en',
      'en',
      ...Object.keys(nested),
      ...Object.keys(images)
        .filter((key) => key.startsWith(`${type}_`))
        .map((key) => key.slice(type.length + 1)),
    ]),
  ];

  const folder = code.replace(/^(\d{3})(\d{3})(\d{3})(\d{4})$/, '$1/$2/$3/$4');

  for (const language of languages) {
    if (!/^[a-z]{2}$/.test(language)) {
      continue;
    }

    for (const selected of [
      object(nested[language]),
      object(images[`${type}_${language}`]),
    ]) {
      const revision = String(selected.rev ?? '');
      const sizes = object(selected.sizes);
      const size = ['400', '200', '100'].find((value) => value in sizes);

      if (/^\d+$/.test(revision) && size) {
        return (
          `https://images.openfoodfacts.org/images/products/` +
          `${folder}/${type}_${language}.${revision}.${size}.jpg`
        );
      }
    }
  }

  return null;
}

function parseArguments(): {
  input: string;
  targets: string;
  threshold: number;
  israelOnly: boolean;
} {
  const args = process.argv.slice(2);
  const values = new Map<string, string>();
  let israelOnly = true;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === '--all-countries') {
      israelOnly = false;
      continue;
    }

    if (!['--input', '--targets', '--threshold'].includes(argument)) {
      throw new Error(`Unknown argument: ${argument}`);
    }

    const value = args[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${argument}`);
    }

    values.set(argument, value);
    index += 1;
  }

  const input = values.get('--input');
  const targets = values.get('--targets');
  const threshold = Number(values.get('--threshold') ?? '0.55');

  if (!input || !targets) {
    throw new Error('Provide --input <file> and --targets <file>');
  }

  if (!Number.isFinite(threshold) || threshold <= 0 || threshold > 1) {
    throw new Error('--threshold must be greater than 0 and at most 1');
  }

  return {
    input: resolve(input),
    targets: resolve(targets),
    threshold,
    israelOnly,
  };
}

async function loadTargets(path: string): Promise<Target[]> {
  const parsed: unknown = JSON.parse(
    (await readFile(path, 'utf8')).replace(/^\uFEFF/, ''),
  );

  const items = Array.isArray(parsed) ? parsed : object(parsed).items;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Targets file must contain a non-empty items array');
  }

  const targets = items.map((value, index): Target => {
    const item = object(value);
    const raw = object(item.externalRawData);
    const name = text(item.name);

    if (!name) {
      throw new Error(`Missing target name at index ${index}`);
    }

    const aliases = Array.isArray(item.searchAliases)
      ? item.searchAliases
          .map(text)
          .filter((alias): alias is string => alias !== null)
      : [];

    const englishName = text(raw.english_name);

    return {
      id: text(item.id) ?? `target_${index + 1}`,
      name,
      aliases: [
        ...new Set([name, ...aliases, ...(englishName ? [englishName] : [])]),
      ].map(searchName),
    };
  });

  if (new Set(targets.map((target) => target.id)).size !== targets.length) {
    throw new Error('Target IDs must be unique');
  }

  return targets;
}

async function main(): Promise<void> {
  const config = parseArguments();

  await access(config.input);
  await access(config.targets);

  const targets = await loadTargets(config.targets);
  const fileInfo = await stat(config.input);

  const matches = new Map<string, Map<string, Candidate>>(
    targets.map((target) => [target.id, new Map<string, Candidate>()]),
  );

  const directory = resolve(
    'import-results',
    `matches-${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID()}`,
  );

  await mkdir(directory, { recursive: true });

  const resultPath = resolve(directory, 'matches.json');
  const startedAt = Date.now();

  let scanned = 0;
  let malformed = 0;
  let marketProducts = 0;
  let invalidBarcodes = 0;
  let missingNames = 0;
  let candidateLinks = 0;
  let stopRequested = false;
  let complete = false;
  let failure: unknown;

  const file = createReadStream(config.input);
  const stream = config.input.endsWith('.gz')
    ? file.pipe(createGunzip())
    : file;

  file.on('error', (error) => {
    if (stream !== file) {
      stream.destroy(error);
    }
  });

  const lines = createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const progress = () => {
    const seconds = Math.max(1, (Date.now() - startedAt) / 1000);
    const inputReadPercent =
      fileInfo.size > 0
        ? Math.min(100, (file.bytesRead / fileInfo.size) * 100)
        : 0;

    console.log({
      scanned,
      inputReadPercent: Number(inputReadPercent.toFixed(1)),
      marketProducts,
      candidateLinks,
      rowsPerSecond: Math.round(scanned / seconds),
      elapsedSeconds: Math.round(seconds),
    });
  };

  const stop = () => {
    if (!stopRequested) {
      stopRequested = true;
      console.log(
        'Stopping after the current record and saving partial results...',
      );
    }
  };

  process.on('SIGINT', stop);

  console.log({
    status: 'STARTED',
    targets: targets.length,
    israelOnly: config.israelOnly,
    inputSizeGB: Number((fileInfo.size / 1024 ** 3).toFixed(2)),
    resultPath,
  });

  const timer = setInterval(progress, 5000);

  try {
    for await (const line of lines) {
      if (stopRequested) {
        break;
      }

      scanned += 1;

      if (!line.trim()) {
        continue;
      }

      let product: Data;

      try {
        const parsed: unknown = JSON.parse(line);

        if (
          parsed === null ||
          typeof parsed !== 'object' ||
          Array.isArray(parsed)
        ) {
          malformed += 1;
          continue;
        }

        product = parsed as Data;
      } catch {
        malformed += 1;
        continue;
      }

      const countries = Array.isArray(product.countries_tags)
        ? product.countries_tags
        : [];

      if (config.israelOnly && !countries.includes('en:israel')) {
        continue;
      }

      marketProducts += 1;

      const normalizedBarcode = normalizeBarcode(product.code);

      if (!normalizedBarcode) {
        invalidBarcodes += 1;
        continue;
      }

      const names = [
        ...new Set(
          [
            text(product.product_name_he),
            text(product.product_name),
            text(product.product_name_en),
          ].filter((name): name is string => name !== null),
        ),
      ].map(searchName);

      if (names.length === 0) {
        missingNames += 1;
        continue;
      }

      for (const target of targets) {
        let bestScore = 0;
        let matchedOn = '';

        for (const alias of target.aliases) {
          for (const name of names) {
            const score = similarity(alias, name);

            if (score > bestScore) {
              bestScore = score;
              matchedOn = `${alias.value} → ${name.value}`;
            }
          }
        }

        if (bestScore < config.threshold) {
          continue;
        }

        const targetMatches = matches.get(target.id);

        if (!targetMatches) {
          continue;
        }

        const previous = targetMatches.get(normalizedBarcode);
        const roundedScore = Number(bestScore.toFixed(6));

        if (previous && previous.matchScore >= roundedScore) {
          continue;
        }

        if (!previous) {
          candidateLinks += 1;
        }

        targetMatches.set(normalizedBarcode, {
          barcode: String(product.code),
          normalizedBarcode,
          name: names[0].value,
          brand: text(product.brands),
          quantity: text(product.quantity),
          imageUrl: imageUrl(product, 'front'),
          nutritionImageUrl: imageUrl(product, 'nutrition'),
          productUrl: `https://world.openfoodfacts.org/product/${product.code}`,
          matchScore: roundedScore,
          matchedOn,
          reviewRequired: true,
          nutrition: object(product.nutriments),
        });
      }
    }

    complete = !stopRequested;
  } catch (error: unknown) {
    failure = error;
  } finally {
    clearInterval(timer);
    process.removeListener('SIGINT', stop);
    lines.close();
    stream.destroy();
    file.destroy();
  }

  progress();

  const products = targets.map((target) => {
    const candidates = [...(matches.get(target.id)?.values() ?? [])].sort(
      (a, b) => b.matchScore - a.matchScore,
    );

    return {
      targetId: target.id,
      targetName: target.name,
      searchAliases: target.aliases.map((alias) => alias.value),
      candidateCount: candidates.length,
      candidates,
    };
  });

  const candidates = products.flatMap((product) => product.candidates);

  const summary = {
    complete,
    stoppedByUser: stopRequested,
    failed: failure !== undefined,
    scanned,
    malformed,
    marketProducts,
    invalidBarcodes,
    missingNames,
    israelOnly: config.israelOnly,
    targets: targets.length,
    targetsWithCandidates: products.filter(
      (product) => product.candidateCount > 0,
    ).length,
    uniqueBarcodes: new Set(
      candidates.map((candidate) => candidate.normalizedBarcode),
    ).size,
    candidateLinks: candidates.length,
    candidateLinksWithImages: candidates.filter(
      (candidate) => candidate.imageUrl !== null,
    ).length,
    threshold: config.threshold,
    elapsedSeconds: Math.round((Date.now() - startedAt) / 1000),
    notice:
      'Text matches are review candidates, not verified product equivalence. ' +
      'Image URLs have not been downloaded or checked. No database changes.',
  };

  const temporaryPath = `${resultPath}.tmp`;

  await writeFile(
    temporaryPath,
    JSON.stringify({ summary, products }, null, 2),
    'utf8',
  );

  await rename(temporaryPath, resultPath);

  console.log(JSON.stringify(summary, null, 2));
  console.log(`Results saved: ${resultPath}`);

  if (failure !== undefined) {
    throw failure;
  }

  if (stopRequested) {
    process.exitCode = 130;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unexpected error');

  process.exitCode = 1;
});
