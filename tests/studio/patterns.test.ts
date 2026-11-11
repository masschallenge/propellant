import { describe, expect, it } from 'vitest';
import { hexToRgb } from '../../src/brand/contrast';
import { findColor } from '../../src/brand/palette';
import {
  PALE_SHARE,
  duotonePixels,
  patternColors,
  trianglePattern,
  type PatternTriangle,
} from '../../src/studio/patterns';

const sign = (
  [firstX, firstY]: number[],
  [secondX, secondY]: number[],
  [thirdX, thirdY]: number[],
) => (firstX - thirdX) * (secondY - thirdY) - (secondX - thirdX) * (firstY - thirdY);

const contains = (triangle: PatternTriangle, point: [number, number]) => {
  const [corner, second, third] = triangle.points;
  const signs = [
    sign(point, corner, second),
    sign(point, second, third),
    sign(point, third, corner),
  ];
  return !(signs.some((value) => value < 0) && signs.some((value) => value > 0));
};

describe('the triangle pattern', () => {
  const width = 1080;
  const height = 1350;
  const triangles = trianglePattern(width, height, 180);

  it('uses only Bright teal and Pale teal', () => {
    expect(patternColors('triangles').map((color) => color.name)).toEqual([
      'Bright teal',
      'Pale teal',
    ]);
    const used = new Set(triangles.map((triangle) => triangle.colorId));
    expect([...used].sort()).toEqual(['bright-teal', 'pale-teal']);
  });

  it('covers the whole canvas with no gaps', () => {
    for (let horizontal = 1; horizontal < width; horizontal += 97) {
      for (let vertical = 1; vertical < height; vertical += 89) {
        expect(triangles.some((triangle) => contains(triangle, [horizontal, vertical]))).toBe(true);
      }
    }
  });

  it('is mostly Bright teal, and the same every time', () => {
    const pale = triangles.filter((triangle) => triangle.colorId === 'pale-teal').length;
    expect(pale / triangles.length).toBeGreaterThan(PALE_SHARE / 2);
    expect(pale / triangles.length).toBeLessThan(0.5);
    expect(trianglePattern(width, height, 180)).toEqual(triangles);
  });
});

describe('the teal duotone', () => {
  const deep = hexToRgb(findColor('deep-teal').hex);
  const bright = hexToRgb(findColor('bright-teal').hex);

  it('maps black to Deep teal and white to Bright teal', () => {
    const result = Array.from(duotonePixels([0, 0, 0, 255, 255, 255, 255, 255]));
    expect(result).toEqual([
      deep.red,
      deep.green,
      deep.blue,
      255,
      bright.red,
      bright.green,
      bright.blue,
      255,
    ]);
  });

  it('keeps transparency and leaves the input alone', () => {
    const input = new Uint8ClampedArray([128, 64, 32, 90]);
    const result = duotonePixels(input);
    expect(result[3]).toBe(90);
    expect(Array.from(input)).toEqual([128, 64, 32, 90]);
    expect(result[0]).toBeGreaterThan(deep.red);
    expect(result[0]).toBeLessThan(bright.red);
  });
});
