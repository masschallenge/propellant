import { describe, expect, it } from 'vitest';
import {
  footprintBounds,
  isInsideFootprint,
  maskOutsideFootprint,
} from '../../src/studio/footprint';
import { BASE_DEFAULTS, type ShapeElement } from '../../src/studio/scene';

const wide: ShapeElement = {
  ...BASE_DEFAULTS,
  id: 'wide',
  kind: 'shape',
  shape: 'block',
  colorId: 'white',
  left: 0,
  top: 45,
  width: 100,
  height: 10,
};

describe('footprint', () => {
  it('covers the rotated shape, not the unrotated box', () => {
    const turned = { ...wide, rotation: 90 };
    const bounds = footprintBounds(turned);
    expect(bounds.left).toBeCloseTo(45);
    expect(bounds.top).toBeCloseTo(0);
    expect(bounds.width).toBeCloseTo(10);
    expect(bounds.height).toBeCloseTo(100);
    expect(isInsideFootprint(turned, 50, 5)).toBe(true);
    expect(isInsideFootprint(turned, 5, 50)).toBe(false);
  });

  it('keeps every pixel of an unrotated element and hides those outside a rotated one', () => {
    const region = { left: 0, top: 0, width: 4, height: 4 };
    const full = maskOutsideFootprint(
      new Uint8ClampedArray(64).fill(255),
      { ...wide, left: 0, top: 0, width: 4, height: 4 },
      region,
      1,
    );
    expect(Array.from(full).filter((value, index) => index % 4 === 3 && value === 0)).toHaveLength(
      0,
    );
    const diamond = { ...wide, left: 0.5, top: 0.5, width: 3, height: 3, rotation: 45 };
    const masked = maskOutsideFootprint(new Uint8ClampedArray(64).fill(255), diamond, region, 1);
    expect(masked[3]).toBe(0);
    expect(masked[(1 * 4 + 1) * 4 + 3]).toBe(255);
  });
});
