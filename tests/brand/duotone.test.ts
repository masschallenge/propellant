import { describe, expect, it } from 'vitest';
import { BRAND_DUOTONE, duotoneChannels } from '../../src/brand/duotone';
import { duotonePixel } from '../../src/brand/photo-check';
import { TEAL_DUOTONE, duotonePixels } from '../../src/studio/patterns';

describe('brand duotone', () => {
  it('runs from Deep teal in the shadows to Bright teal in the highlights', () => {
    expect(BRAND_DUOTONE).toEqual({ shadowId: 'deep-teal', highlightId: 'bright-teal' });
    expect(duotoneChannels(0, 0, 0)).toEqual([4, 68, 81]);
    expect(duotoneChannels(255, 255, 255)).toEqual([15, 172, 189]);
  });

  it('gives the photo checker and the studio the same result for the same pixel', () => {
    expect(TEAL_DUOTONE).toBe(BRAND_DUOTONE);
    [
      [0, 0, 0],
      [128, 64, 200],
      [255, 255, 255],
    ].forEach(([red, green, blue]) => {
      const studio = Array.from(duotonePixels([red, green, blue, 255])).slice(0, 3);
      expect(duotonePixel(red, green, blue)).toEqual(studio);
    });
  });
});
