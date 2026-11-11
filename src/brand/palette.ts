import colorData from './colors.json';

export type ColorFamily = 'brand' | 'accent' | 'neutral';

export interface BrandColor {
  id: string;
  name: string;
  hex: string;
  token: string;
  family: ColorFamily;
  role: string;
}

export interface LogoColor {
  name: string;
  hex: string;
  part: string;
}

export const BRAND_COLORS: BrandColor[] = colorData.brandColors as BrandColor[];

export const LOGO_COLORS: LogoColor[] = colorData.logoColors;

export const findColor = (id: string): BrandColor => {
  const color = BRAND_COLORS.find((candidate) => candidate.id === id);
  if (!color) throw new Error(`Unknown brand color: ${id}`);
  return color;
};
