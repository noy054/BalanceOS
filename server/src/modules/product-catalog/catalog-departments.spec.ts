import { categoryTagsFrom, departmentFor } from './catalog-departments';

describe('departmentFor', () => {
  it('prefers category tags over name keywords', () => {
    expect(departmentFor(['en:dairies', 'en:yogurts'], 'Protein drink')).toBe(
      'DAIRY_EGGS',
    );
  });

  it('places frozen dairy in the frozen department', () => {
    expect(departmentFor(['en:frozen-foods', 'en:ice-creams'], 'גלידה')).toBe(
      'FROZEN',
    );
  });

  it('matches Hebrew names by whole words', () => {
    expect(departmentFor([], 'חלב 3% בקרטון')).toBe('DAIRY_EGGS');
    expect(departmentFor([], 'חטיף חלבון בטעם וניל')).toBe('SPORTS_NUTRITION');
    expect(departmentFor([], 'גבינה לבנה 5%')).toBe('DAIRY_EGGS');
    expect(departmentFor([], 'לחם כוסמין מלא')).toBe('BAKERY');
    expect(departmentFor([], 'מים מינרלים')).toBe('BEVERAGES');
  });

  it('matches prefixed words and phrases', () => {
    expect(departmentFor([], 'Strawberry yogurts')).toBe('DAIRY_EGGS');
    expect(departmentFor([], 'Natural peanut butter')).toBe('SPREADS_CANNED');
  });

  it('falls back to other', () => {
    expect(departmentFor([], 'GO by Yoplait 25')).toBe('OTHER');
  });
});

describe('categoryTagsFrom', () => {
  it('merges the category column with raw source tags', () => {
    expect(
      categoryTagsFrom('en:dairies, en:milks', {
        categories_tags: ['en:milks', 'en:beverages', 7],
      }),
    ).toEqual(['en:dairies', 'en:milks', 'en:beverages']);
  });

  it('ignores missing data', () => {
    expect(categoryTagsFrom(null, null)).toEqual([]);
    expect(categoryTagsFrom(undefined, { categories_tags: 'en:x' })).toEqual(
      [],
    );
  });
});
