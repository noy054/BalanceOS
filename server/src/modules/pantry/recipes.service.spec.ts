import { RecipesService } from './recipes.service';
import { RecipesRepository } from './recipes.repository';
import { PantryItemValidator } from './pantry-item.validator';
import { TemplateLogSyncService } from '../day-logs/template-log-sync.service';

function setup() {
  const recipe = { id: 'r1', items: [] };
  const repo = {
    create: jest.fn().mockResolvedValue(recipe),
    updateWithItems: jest.fn().mockResolvedValue(recipe),
    findByIdAndUserId: jest.fn().mockResolvedValue(recipe),
  };
  const validator = {
    validateProductAmounts: jest.fn(),
    validateImage: jest.fn(),
  };
  const logSync = {
    resolveFromDate: jest.fn().mockReturnValue('2026-11-04'),
    updateRecipe: jest.fn(
      (
        _userId: string,
        _id: string,
        _from: string,
        write: (db: string) => Promise<unknown>,
      ) => write('tx'),
    ),
  };
  const service = new RecipesService(
    repo as unknown as RecipesRepository,
    validator as unknown as PantryItemValidator,
    logSync as unknown as TemplateLogSyncService,
  );
  return { service, repo };
}

const ITEMS = [
  { productId: 'p1', grams: 100 },
  { productId: 'p2', servings: 1 },
];

describe('RecipesService meal categories and images', () => {
  it('stores several meal categories and keeps the first as the legacy type', async () => {
    const { service, repo } = setup();

    await service.create('u1', {
      name: 'Bowl',
      mealTypes: ['LUNCH', 'BREAKFAST'],
      imageUrl: ' file:///bowl.jpg ',
      items: ITEMS,
    });

    expect(repo.create).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({
        mealTypes: ['LUNCH', 'BREAKFAST'],
        mealType: 'LUNCH',
        imageUrl: 'file:///bowl.jpg',
      }),
      ITEMS,
    );
  });

  it('maps a legacy single meal type to the category list', async () => {
    const { service, repo } = setup();

    await service.update('u1', 'r1', { mealType: 'DINNER' });

    expect(repo.updateWithItems).toHaveBeenCalledWith(
      'r1',
      expect.objectContaining({ mealTypes: ['DINNER'], mealType: 'DINNER' }),
      undefined,
      'tx',
    );
  });

  it('clears the image and leaves categories untouched when only the image is removed', async () => {
    const { service, repo } = setup();

    await service.update('u1', 'r1', { imageUrl: null });

    const header = repo.updateWithItems.mock.calls[0][1];
    expect(header.imageUrl).toBeNull();
    expect(header).not.toHaveProperty('mealTypes');
  });
});
