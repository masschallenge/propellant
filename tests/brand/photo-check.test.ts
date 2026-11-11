import { describe, expect, it } from 'vitest';
import {
  INK,
  PHOTO_SHAPES,
  SAFE_ZONE_INSET,
  TEXT_AREAS,
  applyDuotone,
  duotonePixel,
  betterText,
  fitBox,
  formatRatio,
  logoTreatmentFor,
  readArea,
  rgbToHex,
  safeZone,
  shapeRatio,
  toPixels,
  verdictFor,
} from '../../src/brand/photo-check';

const solid = (red: number, green: number, blue: number, count = 10) =>
  Array.from({ length: count }, () => [red, green, blue, 255]).flat();

describe('fitting a photo into a shape', () => {
  it('shows the whole photo by default, scaled down with space around it', () => {
    expect(fitBox(2000, 1000, 100, 100, 'whole')).toEqual({ x: 0, y: 25, width: 100, height: 50 });
  });

  it('fills the shape and crops only when asked, around the chosen point', () => {
    expect(fitBox(2000, 1000, 100, 100, 'fill')).toEqual({
      x: -50,
      y: 0,
      width: 200,
      height: 100,
    });
    expect(fitBox(2000, 1000, 100, 100, 'fill', { x: 0, y: 0.5 }).x).toBe(-0);
  });

  it('never stretches the photo', () => {
    const box = fitBox(1600, 900, 400, 500, 'fill');
    expect(box.width / box.height).toBeCloseTo(1600 / 900, 6);
  });
});

describe('shapes and safe zones', () => {
  it('offers the common shapes', () => {
    expect(PHOTO_SHAPES.map((shape) => shape.label)).toEqual(['1:1', '4:5', '16:9', '9:16']);
    expect(shapeRatio(PHOTO_SHAPES[2])).toBeCloseTo(16 / 9);
  });

  it('insets the safe zone evenly from the shorter side', () => {
    const zone = safeZone(1600, 900);
    expect(zone.x).toBeCloseTo(900 * SAFE_ZONE_INSET);
    expect(zone.y).toBe(zone.x);
    expect(zone.width).toBeCloseTo(1600 - 2 * zone.x);
  });

  it('turns a relative area into whole pixels', () => {
    expect(toPixels(TEXT_AREAS.bottom, 1000, 500)).toEqual({
      x: 60,
      y: 280,
      width: 700,
      height: 160,
    });
  });
});

describe('reading contrast from pixels', () => {
  it('formats hex values', () => {
    expect(rgbToHex(4, 68, 81)).toBe('#044451');
  });

  it('measures a dark area against white and Ink', () => {
    const reading = readArea(solid(4, 68, 81));
    expect(reading.white.typical).toBeCloseTo(10.5, 0);
    expect(reading.white.verdict).toBe('any');
    expect(reading.ink.verdict).toBe('never');
    expect(betterText(reading)).toBe('white');
    expect(logoTreatmentFor(reading)).toBe('white');
    expect(reading.sampleCount).toBe(10);
  });

  it('judges a busy area by its weakest spots, not its average', () => {
    const busy = [...solid(0, 0, 0, 90), ...solid(255, 255, 255, 10)];
    const reading = readArea(busy);
    expect(reading.white.typical).toBeCloseTo(21, 0);
    expect(reading.white.weakest).toBeCloseTo(1, 0);
    expect(reading.white.verdict).toBe('never');
  });

  it('picks Ink and the black logo on a light area', () => {
    const reading = readArea(solid(243, 251, 252));
    expect(betterText(reading)).toBe('ink');
    expect(logoTreatmentFor(reading)).toBe('black');
    expect(INK).toBe('#1E282B');
  });

  it('refuses an empty area', () => {
    expect(() => readArea([])).toThrow();
  });

  it('sorts ratios into the WCAG levels and never rounds up', () => {
    expect(verdictFor(4.5)).toBe('any');
    expect(verdictFor(3.2)).toBe('large');
    expect(verdictFor(2.9)).toBe('never');
    expect(formatRatio(4.49)).toBe('4.4:1');
  });
});

describe('the brand duotone', () => {
  it('maps black to Deep teal and white to Pale teal', () => {
    expect(duotonePixel(0, 0, 0)).toEqual([4, 68, 81]);
    expect(duotonePixel(255, 255, 255)).toEqual([15, 172, 189]);
  });

  it('changes pixels in place and keeps their transparency', () => {
    const pixels = new Uint8ClampedArray([0, 0, 0, 128]);
    applyDuotone(pixels);
    expect(Array.from(pixels)).toEqual([4, 68, 81, 128]);
  });
});

describe('transparent photo pixels', () => {
  it('reads a fully transparent pixel as the white the preview shows, not black', () => {
    const reading = readArea([0, 0, 0, 0]);
    expect(reading.white.weakest).toBeCloseTo(1);
    expect(reading.ink.weakest).toBeGreaterThan(10);
  });

  it('blends a half transparent pixel with the backing', () => {
    const reading = readArea([0, 0, 0, 128], '#FFFFFF');
    expect(reading.white.weakest).toBeGreaterThan(3);
    expect(reading.white.weakest).toBeLessThan(5);
  });
});
