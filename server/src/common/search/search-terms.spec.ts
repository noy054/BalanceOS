import { allTermsWhere, searchTerms } from './search-terms';

describe('searchTerms', () => {
  it('splits on any whitespace and drops duplicates', () => {
    expect(searchTerms('  בשר   טחון בשר ')).toEqual(['בשר', 'טחון']);
  });

  it('returns no terms for empty input', () => {
    expect(searchTerms('   ')).toEqual([]);
    expect(searchTerms(undefined)).toEqual([]);
  });
});

describe('allTermsWhere', () => {
  it('requires every term in any of the fields', () => {
    expect(allTermsWhere(['name', 'brand'], 'בשר טחון')).toEqual({
      AND: [
        {
          OR: [
            { name: { contains: 'בשר', mode: 'insensitive' } },
            { brand: { contains: 'בשר', mode: 'insensitive' } },
          ],
        },
        {
          OR: [
            { name: { contains: 'טחון', mode: 'insensitive' } },
            { brand: { contains: 'טחון', mode: 'insensitive' } },
          ],
        },
      ],
    });
  });

  it('adds no filter for an empty query', () => {
    expect(allTermsWhere(['name'], ' ')).toEqual({});
  });
});
