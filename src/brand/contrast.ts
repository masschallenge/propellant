export interface Rgb {
  red: number;
  green: number;
  blue: number;
}

export type PairingLevel = 'any' | 'large' | 'never';

export const MINIMUM_TEXT_CONTRAST = 4.5;
export const MINIMUM_LARGE_CONTRAST = 3;

export const hexToRgb = (hex: string): Rgb => {
  const digits = hex.replace('#', '');
  const expanded =
    digits.length === 3
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) throw new Error(`Not a hex color: ${hex}`);
  return {
    red: parseInt(expanded.slice(0, 2), 16),
    green: parseInt(expanded.slice(2, 4), 16),
    blue: parseInt(expanded.slice(4, 6), 16),
  };
};

export const formatRgb = (hex: string): string => {
  const { red, green, blue } = hexToRgb(hex);
  return `rgb(${red}, ${green}, ${blue})`;
};

const channelLuminance = (channel: number) => {
  const scaled = channel / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
};

export const relativeLuminance = (hex: string): number => {
  const { red, green, blue } = hexToRgb(hex);
  return (
    0.2126 * channelLuminance(red) +
    0.7152 * channelLuminance(green) +
    0.0722 * channelLuminance(blue)
  );
};

export const contrastRatio = (foreground: string, background: string): number => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

export const pairingLevel = (foreground: string, background: string): PairingLevel => {
  const ratio = contrastRatio(foreground, background);
  if (ratio >= MINIMUM_TEXT_CONTRAST) return 'any';
  if (ratio >= MINIMUM_LARGE_CONTRAST) return 'large';
  return 'never';
};

export const isDark = (hex: string): boolean =>
  contrastRatio('#FFFFFF', hex) >= contrastRatio('#1E282B', hex);

export const mostReadable = (background: string, candidates: string[]): string =>
  candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background) ? candidate : best,
  );
