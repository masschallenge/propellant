import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import colorData from '../../src/brand/colors.json';
import { parseTokenSheet } from '../../src/brand/design-tokens';
import {
  BRAND_COLORS,
  LOGO_COLORS,
  PRINT_NOTES,
  SUPPORTING_COLORS,
  chartColors,
  formatCmyk,
} from '../../src/brand/palette';

describe('one source for the colors', () => {
  it('re-exports the colors from the shared JSON file', () => {
    expect(BRAND_COLORS).toEqual(colorData.brandColors);
    expect(LOGO_COLORS).toEqual(colorData.logoColors);
  });

  it('matches every named color to its Propellant token', () => {
    const colorTokens = parseTokenSheet(
      readFileSync('node_modules/@masschallenge/propellant-web/tokens/color.css', 'utf8'),
    ).base;
    [...BRAND_COLORS, ...SUPPORTING_COLORS].forEach((color) => {
      expect(colorTokens[color.token]?.toUpperCase(), `${color.name} ${color.token}`).toBe(
        color.hex,
      );
    });
  });

  it('keeps the logo colors from the brand guidelines', () => {
    expect(LOGO_COLORS.map((color) => color.hex)).toEqual(['#828486', '#17ACBC']);
    expect(LOGO_COLORS.map((color) => formatCmyk(color.cmyk))).toEqual([
      '53, 44, 43, 7',
      '77, 11, 27, 0',
    ]);
  });

  it('settles the resolved conflicts on Magenta and Mist', () => {
    const hexOf = (id: string) => BRAND_COLORS.find((color) => color.id === id)?.hex;
    expect(hexOf('magenta')).toBe('#BF0261');
    expect(hexOf('mist')).toBe('#F3FBFC');
  });

  it('gives every color a print CMYK value in whole percent', () => {
    [...BRAND_COLORS, ...SUPPORTING_COLORS, ...LOGO_COLORS].forEach((color) => {
      expect(color.cmyk).toHaveLength(4);
      color.cmyk.forEach((channel) => {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(100);
      });
    });
    expect(formatCmyk(BRAND_COLORS[0].cmyk)).toBe('100, 64, 53, 50');
  });

  it('explains the print values and sets no Pantone matches', () => {
    expect(PRINT_NOTES.cmyk).toMatch(/Artifex CMYK SWOP profile/);
    expect(PRINT_NOTES.cmyk).toMatch(/printed proof/);
    expect(PRINT_NOTES.pantone).toBe('Pantone matches are not set; print from the CMYK values.');
  });

  it('adds the two supporting neutrals from the Propellant tokens', () => {
    expect(SUPPORTING_COLORS.map((color) => [color.hex, color.token])).toEqual([
      ['#DBE1E3', '--gray-100'],
      ['#848F92', '--gray-300'],
    ]);
  });

  it('orders the chart colors the same way everywhere', () => {
    expect(chartColors().map((color) => color.name)).toEqual([
      'Teal',
      'Yellow',
      'Slate',
      'Bright teal',
      'Deep teal',
      'Gray 300',
    ]);
  });
});
