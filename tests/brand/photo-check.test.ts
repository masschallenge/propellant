import { describe, expect, it } from 'vitest';
import {
  BLACK,
  PHOTO_SHAPES,
  SAFE_ZONE_INSET,
  TEXT_AREAS,
  TEXT_SIDES,
  applyOverlayFor,
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

  it('measures a dark area against White and Black', () => {
    const reading = readArea(solid(16, 38, 63));
    expect(reading.white.typical).toBeCloseTo(15.3, 0);
    expect(reading.white.verdict).toBe('any');
    expect(reading.black.verdict).toBe('never');
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

  it('picks Black and the black logo on a light area', () => {
    const reading = readArea(solid(248, 248, 245));
    expect(betterText(reading)).toBe('black');
    expect(logoTreatmentFor(reading)).toBe('black');
    expect(BLACK).toBe('#222222');
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

describe('the hero overlay in the photo check', () => {
  it('runs the overlay toward the subject, away from the words', () => {
    expect(TEXT_SIDES).toEqual({ top: 'top', bottom: 'bottom' });
  });

  it('darkens the text side more than the subject side and keeps transparency', () => {
    const white = [255, 255, 255, 128];
    const pixels = new Uint8ClampedArray([...white, ...white]);
    applyOverlayFor(pixels, 1, 2, 'bottom');
    const brightness = (offset: number) => pixels[offset] + pixels[offset + 1] + pixels[offset + 2];
    expect(pixels[3]).toBe(128);
    expect(pixels[7]).toBe(128);
    expect(brightness(4)).toBeLessThan(brightness(0));
  });
});

describe('transparent photo pixels', () => {
  it('reads a fully transparent pixel as the white the preview shows, not black', () => {
    const reading = readArea([0, 0, 0, 0]);
    expect(reading.white.weakest).toBeCloseTo(1);
    expect(reading.black.weakest).toBeGreaterThan(10);
  });

  it('blends a half transparent pixel with the backing', () => {
    const reading = readArea([0, 0, 0, 128], '#FFFFFF');
    expect(reading.white.weakest).toBeGreaterThan(3);
    expect(reading.white.weakest).toBeLessThan(5);
  });
});
