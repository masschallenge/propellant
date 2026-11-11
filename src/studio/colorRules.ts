import { BRAND_COLORS, LOGO_COLORS, findColor, type BrandColor } from '../brand/palette';

const TEXT_RESERVATIONS: Record<string, string> = {
  teal: 'Teal means you can act on something, so it is not for headlines or words in a post.',
  'mid-teal': 'Mid teal is a supporting accent for shapes and icons, not text.',
  'pale-teal': 'Pale teal tints a background, it is not a text color.',
  mist: 'Mist is the lightest tint, for backgrounds, not text.',
  magenta: 'Magenta means something is wrong. Never use it decoratively.',
  yellow: 'Yellow highlights. Set dark text on it, never yellow text.',
};

const SHAPE_RESERVATIONS: Record<string, string> = {
  magenta: 'Magenta means something is wrong. Never use it decoratively.',
};

export const BACKGROUND_COLOR_IDS = ['white', 'mist', 'pale-teal', 'deep-teal', 'teal'];

export const textReservation = (colorId: string): string | null =>
  TEXT_RESERVATIONS[colorId] ?? null;

export const shapeReservation = (colorId: string): string | null =>
  SHAPE_RESERVATIONS[colorId] ?? null;

export const backgroundColors = (): BrandColor[] => BACKGROUND_COLOR_IDS.map(findColor);

export const shapeColors = (): BrandColor[] =>
  BRAND_COLORS.filter((color) => !shapeReservation(color.id));

export const textColors = (): BrandColor[] =>
  BRAND_COLORS.filter((color) => !textReservation(color.id));

export const LOGO_GRAY = LOGO_COLORS[0].hex;
