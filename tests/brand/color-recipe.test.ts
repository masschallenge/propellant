import { describe, expect, it } from 'vitest';
import {
  COLOR_RECIPE,
  recipePortions,
  recipeTotal,
  shareOfFamily,
} from '../../src/brand/color-recipe';
import { BRAND_COLORS } from '../../src/brand/palette';

const shareOf = (colorId: string) =>
  COLOR_RECIPE.find((ingredient) => ingredient.colorId === colorId)?.share ?? 0;

describe('color recipe', () => {
  it('adds up to a whole', () => {
    expect(recipeTotal()).toBe(100);
  });

  it('uses every palette color exactly once', () => {
    const ids = COLOR_RECIPE.map((ingredient) => ingredient.colorId).sort();
    expect(ids).toEqual(BRAND_COLORS.map((color) => color.id).sort());
    expect(recipePortions()).toHaveLength(BRAND_COLORS.length);
  });

  it('is mostly white and neutrals, then teals, then a little accent', () => {
    expect(shareOf('white')).toBeGreaterThanOrEqual(50);
    expect(shareOfFamily('neutral')).toBeGreaterThan(shareOfFamily('brand'));
    expect(shareOfFamily('brand')).toBeGreaterThan(shareOfFamily('accent'));
    expect(shareOf('magenta')).toBeLessThanOrEqual(shareOf('teal'));
    expect(shareOf('yellow')).toBeLessThanOrEqual(shareOf('teal'));
  });

  it('gives every ingredient a reason', () => {
    COLOR_RECIPE.forEach((ingredient) => expect(ingredient.reason.length).toBeGreaterThan(0));
  });
});
