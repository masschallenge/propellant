import { describe, expect, it } from 'vitest';
import {
  LIGHT_SHARE,
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

  it('uses only MC Blue and the light tint', () => {
    expect(patternColors('triangles').map((color) => color.name)).toEqual([
      'MC Blue',
      'Light tint',
    ]);
    const used = new Set(triangles.map((triangle) => triangle.colorId));
    expect([...used].sort()).toEqual(['light-tint', 'mc-blue']);
  });

  it('covers the whole canvas with no gaps', () => {
    for (let horizontal = 1; horizontal < width; horizontal += 97) {
      for (let vertical = 1; vertical < height; vertical += 89) {
        expect(triangles.some((triangle) => contains(triangle, [horizontal, vertical]))).toBe(true);
      }
    }
  });

  it('is mostly MC Blue, and the same every time', () => {
    const light = triangles.filter((triangle) => triangle.colorId === 'light-tint').length;
    expect(light / triangles.length).toBeGreaterThan(LIGHT_SHARE / 2);
    expect(light / triangles.length).toBeLessThan(0.5);
    expect(trianglePattern(width, height, 180)).toEqual(triangles);
  });
});
