import { describe, expect, it } from 'vitest';
import colorData from '../../src/brand/colors.json';
import { BRAND_COLORS, LOGO_COLORS } from '../../src/brand/palette';

describe('one source for the colors', () => {
  it('re-exports the colors from the shared JSON file', () => {
    expect(BRAND_COLORS).toEqual(colorData.brandColors);
    expect(LOGO_COLORS).toEqual(colorData.logoColors);
  });

  it('keeps the logo colors from the brand guidelines', () => {
    expect(LOGO_COLORS.map((color) => color.hex)).toEqual(['#828486', '#17ACBC']);
  });
});
