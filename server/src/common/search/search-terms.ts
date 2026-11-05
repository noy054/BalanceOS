const MAX_TERMS = 8;

type TermFilter = { contains: string; mode: 'insensitive' };

export function searchTerms(query: string | null | undefined): string[] {
  if (!query) return [];
  const terms = query
    .normalize('NFC')
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean);
  return [...new Set(terms)].slice(0, MAX_TERMS);
}

export function allTermsWhere<F extends string>(
  fields: readonly F[],
  query: string | null | undefined,
): { AND: { OR: Partial<Record<F, TermFilter>>[] }[] } | Record<string, never> {
  const terms = searchTerms(query);
  if (terms.length === 0) return {};
  return {
    AND: terms.map((term) => ({
      OR: fields.map(
        (field) =>
          ({
            [field]: { contains: term, mode: 'insensitive' },
          }) as Partial<Record<F, TermFilter>>,
      ),
    })),
  };
}
