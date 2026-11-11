import { findColor } from './palette';
import type { BrandColor } from './palette';

export interface RecipeIngredient {
  colorId: string;
  share: number;
  reason: string;
}

export interface RecipePortion extends RecipeIngredient {
  color: BrandColor;
}

export const COLOR_RECIPE: RecipeIngredient[] = [
  { colorId: 'white', share: 50, reason: 'Most of the page is white.' },
  { colorId: 'ink', share: 12, reason: 'Text on light backgrounds.' },
  { colorId: 'slate', share: 6, reason: 'Secondary text.' },
  { colorId: 'mist', share: 8, reason: 'The lightest tint, for quiet panels.' },
  { colorId: 'pale-teal', share: 6, reason: 'Tinted backgrounds.' },
  { colorId: 'deep-teal', share: 8, reason: 'Brand surfaces and big brand moments.' },
  { colorId: 'teal', share: 5, reason: 'Things you can act on.' },
  { colorId: 'mid-teal', share: 2, reason: 'Supporting accents.' },
  { colorId: 'bright-teal', share: 1, reason: 'Accents on dark surfaces.' },
  { colorId: 'yellow', share: 1, reason: 'Highlights only.' },
  { colorId: 'magenta', share: 1, reason: 'Only when something is wrong.' },
];

export const recipePortions = (recipe: RecipeIngredient[] = COLOR_RECIPE): RecipePortion[] =>
  recipe.map((ingredient) => ({ ...ingredient, color: findColor(ingredient.colorId) }));

export const recipeTotal = (recipe: RecipeIngredient[] = COLOR_RECIPE): number =>
  recipe.reduce((total, ingredient) => total + ingredient.share, 0);

export const shareOfFamily = (
  family: BrandColor['family'],
  recipe: RecipeIngredient[] = COLOR_RECIPE,
): number =>
  recipePortions(recipe)
    .filter((portion) => portion.color.family === family)
    .reduce((total, portion) => total + portion.share, 0);
