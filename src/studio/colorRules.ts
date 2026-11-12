import { DARK_SECTION_IDS, LOGO_COLORS, findColor, type BrandColor } from '../brand/palette';

const TEXT_RESERVATIONS: Record<string, string> = {
  'mc-blue': 'MC Blue is for the logo and shapes, never text.',
  'mc-gray': 'MC Gray belongs to the logo only.',
  ocean: 'Ocean is a gradient stop only, never a flat color.',
  yellow: 'Yellow is for tags, rules and stats with dark text on them, not a text color.',
  orange: 'Orange takes dark text on it, it is not a text color.',
  raspberry: 'Raspberry is for shapes and rules on dark backgrounds, not text.',
};

const SHAPE_RESERVATIONS: Record<string, string> = {
  'mc-gray': 'MC Gray belongs to the logo only.',
  ocean: 'Ocean is a gradient stop only, never a flat fill.',
};

export const ON_DARK_ONLY_TEXT_IDS = ['cyan', 'lime'];

export const ON_DARK_ONLY_SHAPE_IDS = ['cyan', 'raspberry', 'lime'];

export const BACKGROUND_COLOR_IDS = ['white', 'warm-white', 'navy', 'black', 'deep-teal'];

const darkSectionNames = () =>
  DARK_SECTION_IDS.map((id) => findColor(id).name)
    .join(', ')
    .replace(/, ([^,]*)$/, ' or $1');

const isAllDark = (backdropIds: string[]) =>
  backdropIds.length > 0 && backdropIds.every((id) => DARK_SECTION_IDS.includes(id));

export const onDarkOnlyReason = (colorId: string): string =>
  `${findColor(colorId).name} only goes on ${darkSectionNames()}.`;

export const textReservation = (
  colorId: string,
  backdropIds: string[] | null = null,
): string | null => {
  if (TEXT_RESERVATIONS[colorId]) return TEXT_RESERVATIONS[colorId];
  if (ON_DARK_ONLY_TEXT_IDS.includes(colorId) && backdropIds && !isAllDark(backdropIds)) {
    return onDarkOnlyReason(colorId);
  }
  return null;
};

export const shapeReservation = (colorId: string): string | null =>
  SHAPE_RESERVATIONS[colorId] ?? null;

export const shapeNeedsDark = (colorId: string, backdropIds: string[] | null): boolean =>
  ON_DARK_ONLY_SHAPE_IDS.includes(colorId) && backdropIds !== null && !isAllDark(backdropIds);

export const backgroundColors = (): BrandColor[] => BACKGROUND_COLOR_IDS.map(findColor);

export const LOGO_GRAY = LOGO_COLORS[0].hex;
