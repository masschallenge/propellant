import { BRAND_DUOTONE, duotoneChannels } from './duotone';
import { MINIMUM_LARGE_CONTRAST, MINIMUM_TEXT_CONTRAST, contrastRatio, hexToRgb } from './contrast';
import { findColor } from './palette';

export interface PhotoShape {
  id: string;
  label: string;
  width: number;
  height: number;
  description: string;
}

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type FitMode = 'whole' | 'fill';

export type TextPlacement = 'top' | 'bottom';

export type ContrastVerdict = 'any' | 'large' | 'never';

export interface ContrastReading {
  typical: number;
  weakest: number;
  verdict: ContrastVerdict;
}

export interface AreaReading {
  white: ContrastReading;
  ink: ContrastReading;
  sampleCount: number;
}

export const WHITE = findColor('white').hex;
export const INK = findColor('ink').hex;

export const PHOTO_SHAPES: PhotoShape[] = [
  { id: 'square', label: '1:1', width: 1, height: 1, description: 'Square' },
  { id: 'portrait', label: '4:5', width: 4, height: 5, description: 'Portrait' },
  {
    id: 'wide',
    label: '16:9',
    width: 16,
    height: 9,
    description: 'Wide, like a slide or a web banner',
  },
  { id: 'tall', label: '9:16', width: 9, height: 16, description: 'Tall, like a social story' },
];

export const SAFE_ZONE_INSET = 0.1;

export const WEAKEST_SHARE = 0.05;

export const TEXT_AREAS: Record<TextPlacement, Box> = {
  top: { x: 0.06, y: 0.2, width: 0.7, height: 0.3 },
  bottom: { x: 0.06, y: 0.56, width: 0.7, height: 0.32 },
};

export const LOGO_AREA: Box = { x: 0.06, y: 0.06, width: 0.32, height: 0.09 };

export const fitBox = (
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  mode: FitMode,
  focus: { x: number; y: number } = { x: 0.5, y: 0.5 },
): Box => {
  const widthScale = frameWidth / imageWidth;
  const heightScale = frameHeight / imageHeight;
  const scale =
    mode === 'whole' ? Math.min(widthScale, heightScale) : Math.max(widthScale, heightScale);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return {
    x: (frameWidth - width) * focus.x,
    y: (frameHeight - height) * focus.y,
    width,
    height,
  };
};

export const safeZone = (frameWidth: number, frameHeight: number, inset = SAFE_ZONE_INSET): Box => {
  const margin = Math.min(frameWidth, frameHeight) * inset;
  return {
    x: margin,
    y: margin,
    width: frameWidth - margin * 2,
    height: frameHeight - margin * 2,
  };
};

export const shapeRatio = (shape: PhotoShape) => shape.width / shape.height;

export const toPixels = (area: Box, width: number, height: number): Box => ({
  x: Math.round(area.x * width),
  y: Math.round(area.y * height),
  width: Math.max(1, Math.round(area.width * width)),
  height: Math.max(1, Math.round(area.height * height)),
});

const toHexChannel = (channel: number) => channel.toString(16).padStart(2, '0');

export const rgbToHex = (red: number, green: number, blue: number) =>
  `#${toHexChannel(red)}${toHexChannel(green)}${toHexChannel(blue)}`.toUpperCase();

export const verdictFor = (ratio: number): ContrastVerdict => {
  if (ratio >= MINIMUM_TEXT_CONTRAST) return 'any';
  if (ratio >= MINIMUM_LARGE_CONTRAST) return 'large';
  return 'never';
};

const percentile = (sorted: number[], share: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * share))];

const readingFrom = (ratios: number[]): ContrastReading => {
  const sorted = [...ratios].sort((first, second) => first - second);
  const weakest = percentile(sorted, WEAKEST_SHARE);
  return { typical: percentile(sorted, 0.5), weakest, verdict: verdictFor(weakest) };
};

export const PHOTO_BACKING = WHITE;

const overBacking = (channel: number, alpha: number, backing: number) =>
  Math.round(channel * alpha + backing * (1 - alpha));

export const readArea = (pixels: ArrayLike<number>, backingHex = PHOTO_BACKING): AreaReading => {
  const backing = hexToRgb(backingHex);
  const whiteRatios: number[] = [];
  const inkRatios: number[] = [];
  const cache = new Map<string, [number, number]>();
  for (let offset = 0; offset + 3 < pixels.length; offset += 4) {
    const alpha = pixels[offset + 3] / 255;
    const hex = rgbToHex(
      overBacking(pixels[offset], alpha, backing.red),
      overBacking(pixels[offset + 1], alpha, backing.green),
      overBacking(pixels[offset + 2], alpha, backing.blue),
    );
    const known = cache.get(hex) ?? [contrastRatio(WHITE, hex), contrastRatio(INK, hex)];
    cache.set(hex, known);
    whiteRatios.push(known[0]);
    inkRatios.push(known[1]);
  }
  if (!whiteRatios.length) throw new Error('No pixels to read');
  return {
    white: readingFrom(whiteRatios),
    ink: readingFrom(inkRatios),
    sampleCount: whiteRatios.length,
  };
};

export const betterText = (reading: AreaReading): 'white' | 'ink' =>
  reading.white.weakest >= reading.ink.weakest ? 'white' : 'ink';

export const logoTreatmentFor = (reading: AreaReading): 'white' | 'black' =>
  betterText(reading) === 'white' ? 'white' : 'black';

export const formatRatio = (ratio: number) => `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`;

export const duotonePixel = (red: number, green: number, blue: number): [number, number, number] =>
  duotoneChannels(red, green, blue, BRAND_DUOTONE);

export const applyDuotone = (pixels: Uint8ClampedArray) => {
  for (let offset = 0; offset + 3 < pixels.length; offset += 4) {
    const [red, green, blue] = duotonePixel(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
    pixels[offset] = red;
    pixels[offset + 1] = green;
    pixels[offset + 2] = blue;
  }
  return pixels;
};
