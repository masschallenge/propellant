import colorData from './colors.json';

export type ColorFamily = 'brand' | 'accent' | 'neutral';

export type Cmyk = [number, number, number, number];

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  token: string;
  family: ColorFamily;
  role: string;
  cmyk: Cmyk;
}

export interface SupportingColor {
  id: string;
  name: string;
  hex: string;
  token: string;
  role: string;
  cmyk: Cmyk;
}

export interface LogoColor {
  name: string;
  hex: string;
  part: string;
  cmyk: Cmyk;
}

export const BRAND_COLORS: BrandColor[] = colorData.brandColors as BrandColor[];

export const SUPPORTING_COLORS: SupportingColor[] = colorData.supportingColors as SupportingColor[];

export const LOGO_COLORS: LogoColor[] = colorData.logoColors as LogoColor[];

export const PRINT_NOTES = colorData.print;

export const CHART_ORDER = ['teal', 'yellow', 'slate', 'bright-teal', 'deep-teal', 'gray-300'];

export const formatCmyk = (cmyk: Cmyk): string => cmyk.join(', ');

export const findColor = (id: string): BrandColor => {
  const color = BRAND_COLORS.find((candidate) => candidate.id === id);
  if (!color) throw new Error(`Unknown brand color: ${id}`);
  return color;
};

export const chartColors = (): (BrandColor | SupportingColor)[] =>
  CHART_ORDER.map(
    (id) =>
      BRAND_COLORS.find((color) => color.id === id) ??
      SUPPORTING_COLORS.find((color) => color.id === id) ??
      findColor(id),
  );
