import colorData from './colors.json';

export type ColorFamily = 'core' | 'supporting' | 'accent' | 'neutral';

export type Cmyk = [number, number, number, number];

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  token?: string;
  family: ColorFamily;
  role: string;
  cmyk: Cmyk | null;
  printSubstitute: string | null;
}

export type SupportingColor = BrandColor;

export interface LogoColor {
  name: string;
  hex: string;
  part: string;
  cmyk: Cmyk;
}

export interface PrintNotes {
  cmyk: string;
  review: string;
  logoFiles: string;
}

export const BRAND_COLORS: BrandColor[] = colorData.brandColors as BrandColor[];

export const SUPPORTING_COLORS: SupportingColor[] = colorData.supportingColors as SupportingColor[];

export const LOGO_COLORS: LogoColor[] = colorData.logoColors as LogoColor[];

export const PRINT_NOTES: PrintNotes = colorData.print;

export const FAMILY_NAMES: Record<ColorFamily, string> = {
  core: 'Core',
  supporting: 'Supporting blue',
  accent: 'Warm accent',
  neutral: 'Neutral',
};

export const CHART_ORDER = ['teal', 'yellow', 'navy', 'mc-blue', 'deep-teal', 'gray-300'];

export const DARK_SECTION_IDS = ['navy', 'black', 'deep-teal'];

export const LIGHT_SECTION_IDS = ['white', 'warm-white'];

export const MC_GRADIENT = { fromId: 'navy', toId: 'ocean' };

export const formatCmyk = (cmyk: Cmyk): string => cmyk.join(', ');

const NAMED_COLORS = [...BRAND_COLORS, ...SUPPORTING_COLORS];

export const findColor = (id: string): BrandColor => {
  const color = NAMED_COLORS.find((candidate) => candidate.id === id);
  if (!color) throw new Error(`Unknown brand color: ${id}`);
  return color;
};

export const colorsInFamily = (family: ColorFamily): BrandColor[] =>
  BRAND_COLORS.filter((color) => color.family === family);

export const isWarmAccent = (colorId: string): boolean =>
  BRAND_COLORS.some((color) => color.id === colorId && color.family === 'accent');

export const gradientCss = (angle = 135): string =>
  `linear-gradient(${angle}deg, ${findColor(MC_GRADIENT.fromId).hex}, ${findColor(MC_GRADIENT.toId).hex})`;

export const chartColors = (): BrandColor[] => CHART_ORDER.map(findColor);
