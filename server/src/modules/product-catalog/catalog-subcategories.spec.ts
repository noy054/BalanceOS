import { classifyCatalogItem, subcategoryFor } from './catalog-subcategories';

describe('subcategoryFor', () => {
  it('keeps potatoes out of fruits', () => {
    expect(subcategoryFor('PRODUCE', 'תפוח אדמה לבן')).toBe('VEGETABLES');
    expect(subcategoryFor('PRODUCE', 'תפוח עץ גרני סמית')).toBe('FRUITS');
  });

  it('matches whole words instead of fragments', () => {
    expect(subcategoryFor('MEAT_FISH', 'Hamburger patties')).not.toBe('DELI');
    expect(subcategoryFor('MEAT_FISH', 'Smoked ham')).toBe('DELI');
    expect(subcategoryFor('BREAKFAST', 'דגני בוקר')).toBe('CEREAL');
    expect(subcategoryFor('MEAT_FISH', 'דגני בוקר')).toBeNull();
  });

  it('finds milk when the word ends the name', () => {
    expect(subcategoryFor('DAIRY_EGGS', 'יטבתה חלב')).toBe('MILK');
  });

  it('supports stems and punctuated words', () => {
    expect(subcategoryFor('DAIRY_EGGS', 'גבינה צהובה')).toBe('CHEESE');
    expect(subcategoryFor('SNACKS_SWEETS', "צ'יפס תפוחי אדמה")).toBe('SALTY');
  });

  it('classifies department and subcategory together', () => {
    expect(classifyCatalogItem(null, null, 'יוגורט 3%')).toEqual({
      department: 'DAIRY_EGGS',
      subcategoryKey: 'YOGURT',
    });
  });
});
