import { hexToRgb } from '../brand/contrast';
import { findColor, type BrandColor } from '../brand/palette';

export type PatternId = 'triangles';

export const PATTERN_NAMES: Record<PatternId, string> = {
  triangles: 'Triangle pattern',
};

export const PATTERN_COLOR_IDS: Record<PatternId, string[]> = {
  triangles: ['bright-teal', 'pale-teal'],
};

export const patternColors = (pattern: PatternId): BrandColor[] =>
  PATTERN_COLOR_IDS[pattern].map(findColor);

export type Point = [number, number];

export interface PatternTriangle {
  points: [Point, Point, Point];
  colorId: string;
}

export const PALE_SHARE = 0.3;

const cellNoise = (row: number, column: number, seed: number): number => {
  const mixed = Math.sin(row * 127.1 + column * 311.7 + seed * 74.7) * 43758.5453;
  return mixed - Math.floor(mixed);
};

export const triangleSide = (width: number, height: number): number =>
  Math.max(24, Math.round(Math.min(width, height) / 9));

export const trianglePattern = (
  width: number,
  height: number,
  side: number = triangleSide(width, height),
  seed = 1,
): PatternTriangle[] => {
  const rowHeight = (side * Math.sqrt(3)) / 2;
  const halfSide = side / 2;
  const [mainId, paleId] = PATTERN_COLOR_IDS.triangles;
  const triangles: PatternTriangle[] = [];
  const rows = Math.ceil(height / rowHeight);
  const columns = Math.ceil(width / halfSide) + 2;
  for (let row = 0; row < rows; row += 1) {
    const top = row * rowHeight;
    const bottom = top + rowHeight;
    const shift = row % 2 ? halfSide : 0;
    for (let column = -1; column < columns; column += 1) {
      const left = column * halfSide - shift;
      const isUpward = (column + row) % 2 === 0;
      const points: [Point, Point, Point] = isUpward
        ? [
            [left, bottom],
            [left + halfSide, top],
            [left + side, bottom],
          ]
        : [
            [left, top],
            [left + side, top],
            [left + halfSide, bottom],
          ];
      const colorId = cellNoise(row, column, seed) < PALE_SHARE ? paleId : mainId;
      triangles.push({ points, colorId });
    }
  }
  return triangles;
};

export interface Duotone {
  shadowId: string;
  highlightId: string;
}

export const TEAL_DUOTONE: Duotone = { shadowId: 'deep-teal', highlightId: 'bright-teal' };

export type PixelData = Uint8ClampedArray | number[];

export const duotonePixels = (pixels: PixelData, duotone: Duotone = TEAL_DUOTONE): PixelData => {
  const shadow = hexToRgb(findColor(duotone.shadowId).hex);
  const highlight = hexToRgb(findColor(duotone.highlightId).hex);
  const result = pixels.slice() as PixelData;
  for (let offset = 0; offset + 3 < pixels.length; offset += 4) {
    const lightness =
      (0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2]) / 255;
    result[offset] = Math.round(shadow.red + (highlight.red - shadow.red) * lightness);
    result[offset + 1] = Math.round(shadow.green + (highlight.green - shadow.green) * lightness);
    result[offset + 2] = Math.round(shadow.blue + (highlight.blue - shadow.blue) * lightness);
    result[offset + 3] = pixels[offset + 3];
  }
  return result;
};
