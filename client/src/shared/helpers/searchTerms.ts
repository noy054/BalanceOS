const MAX_TERMS = 8;

export function searchTerms(query: string): string[] {
  const terms = query
    .normalize("NFC")
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return [...new Set(terms)].slice(0, MAX_TERMS);
}

export function matchesAllTerms(query: string, ...fields: (string | null | undefined)[]) {
  const terms = searchTerms(query);
  if (terms.length === 0) return true;
  const haystack = fields
    .filter((field): field is string => Boolean(field))
    .map((field) => field.normalize("NFC").toLocaleLowerCase());
  return terms.every((term) => haystack.some((field) => field.includes(term)));
}
