import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import colorData from '../../src/brand/colors.json';
import { formatRgb } from '../../src/brand/contrast';
import { parseTokenSheet } from '../../src/brand/design-tokens';
import {
  BRAND_COLORS,
  DARK_SECTION_IDS,
  LOGO_COLORS,
  PRINT_NOTES,
  SUPPORTING_COLORS,
  chartColors,
  colorsInFamily,
  findColor,
  formatCmyk,
  gradientCss,
  isWarmAccent,
} from '../../src/brand/palette';

const OLD_BRAND_NAMES = [
  'Deep teal',
  'Mid teal',
  'Bright teal',
  'Pale teal',
  'Mist',
  'Ink',
  'Magenta',
  'Logo teal',
  'Logo gray',
];

describe('one source for the colors', () => {
  it('re-exports the colors from the shared JSON file', () => {
    expect(BRAND_COLORS).toEqual(colorData.brandColors);
    expect(LOGO_COLORS).toEqual(colorData.logoColors);
  });

  it('matches every color that has a Propellant token to that token', () => {
    const colorTokens = parseTokenSheet(
      readFileSync('node_modules/@masschallenge/propellant-web/tokens/color.css', 'utf8'),
    ).base;
    [...BRAND_COLORS, ...SUPPORTING_COLORS]
      .filter((color) => color.token)
      .forEach((color) => {
        expect(colorTokens[color.token as string]?.toUpperCase(), color.name).toBe(color.hex);
      });
  });
});

describe('the brand guide palette', () => {
  it('names a Propellant token for every brand color', () => {
    BRAND_COLORS.forEach((color) => expect(color.token, color.name).toBeTruthy());
  });

  it('holds the core, supporting and warm accent colors with their official values', () => {
    const values = Object.fromEntries(BRAND_COLORS.map((color) => [color.name, color.hex]));
    expect(values).toEqual({
      'MC Blue': '#0EABBC',
      'MC Gray': '#808285',
      Navy: '#10263F',
      Black: '#222222',
      'Warm White': '#F8F8F5',
      White: '#FFFFFF',
      'Deep Teal': '#004F73',
      Teal: '#00708E',
      Cyan: '#54EEFF',
      Ocean: '#037AA6',
      Yellow: '#FFC801',
      Orange: '#FF6B35',
      Raspberry: '#D14170',
      Lime: '#C6F135',
    });
  });

  it('groups the colors the way the guide does', () => {
    const names = (family: Parameters<typeof colorsInFamily>[0]) =>
      colorsInFamily(family).map((color) => color.name);
    expect(names('core')).toEqual(['MC Blue', 'MC Gray', 'Navy', 'Black', 'Warm White']);
    expect(names('supporting')).toEqual(['Deep Teal', 'Teal', 'Cyan', 'Ocean']);
    expect(names('accent')).toEqual(['Yellow', 'Orange', 'Raspberry', 'Lime']);
    expect(isWarmAccent('orange')).toBe(true);
    expect(isWarmAccent('teal')).toBe(false);
  });

  it('matches the RGB values in the guide', () => {
    expect(formatRgb(findColor('navy').hex)).toBe('rgb(16, 38, 63)');
    expect(formatRgb(findColor('cyan').hex)).toBe('rgb(84, 238, 255)');
    expect(formatRgb(findColor('ocean').hex)).toBe('rgb(3, 122, 166)');
  });

  it('gives the official approximate CMYK values, and none for Ocean', () => {
    expect(formatCmyk(findColor('mc-blue').cmyk ?? [0, 0, 0, 0])).toBe('93, 9, 0, 26');
    expect(formatCmyk(findColor('deep-teal').cmyk ?? [0, 0, 0, 0])).toBe('100, 31, 0, 55');
    expect(formatCmyk(findColor('lime').cmyk ?? [0, 0, 0, 0])).toBe('32, 0, 74, 17');
    expect(findColor('ocean').cmyk).toBeNull();
    [...BRAND_COLORS, ...SUPPORTING_COLORS, ...LOGO_COLORS].forEach((color) => {
      (color.cmyk ?? []).forEach((channel) => {
        expect(Number.isInteger(channel)).toBe(true);
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(100);
      });
    });
  });

  it('lists the print substitutes', () => {
    const substitutes = BRAND_COLORS.filter((color) => color.printSubstitute).map((color) => [
      color.name,
      color.printSubstitute,
    ]);
    expect(substitutes).toEqual([
      ['Cyan', '#00CFE8'],
      ['Orange', '#F58242'],
      ['Raspberry', '#D83B80'],
      ['Lime', '#91D438'],
    ]);
  });

  it('says the print values are approximate and gives CMYK only', () => {
    expect(PRINT_NOTES.cmyk).toMatch(/approximate, confirm with a printer proof/);
    expect(JSON.stringify(colorData)).not.toMatch(/pantone|artifex|swop/i);
    expect(PRINT_NOTES.review).toMatch(/reviewed with each version/);
  });

  it('retires the old Propellant brand names', () => {
    const names = [...BRAND_COLORS, ...SUPPORTING_COLORS, ...LOGO_COLORS].map(
      (color) => color.name,
    );
    OLD_BRAND_NAMES.forEach((name) => expect(names).not.toContain(name));
  });

  it('keeps Navy, Black and Deep Teal as the dark sections', () => {
    expect(DARK_SECTION_IDS.map((id) => findColor(id).name)).toEqual([
      'Navy',
      'Black',
      'Deep Teal',
    ]);
  });

  it('runs the MC Gradient from Navy to Ocean', () => {
    expect(gradientCss(90)).toBe('linear-gradient(90deg, #10263F, #037AA6)');
  });
});

describe('logo colors', () => {
  it('uses the official MC Blue and MC Gray', () => {
    expect(LOGO_COLORS.map((color) => [color.name, color.hex])).toEqual([
      ['MC Gray', '#808285'],
      ['MC Blue', '#0EABBC'],
    ]);
    expect(PRINT_NOTES.logoFiles).toMatch(/#17ACBC and #828486/);
    expect(PRINT_NOTES.logoFiles).toMatch(/MassChallenge Marketing/);
  });
});

describe('supporting neutrals and charts', () => {
  it('adds the light tint and the grays from the Propellant tokens', () => {
    expect(SUPPORTING_COLORS.map((color) => [color.name, color.hex, color.token ?? null])).toEqual([
      ['Light tint', '#F3FAFC', '--mc-light-tint'],
      ['Gray 100', '#DBE1E3', '--gray-100'],
      ['Gray 300', '#848F92', '--gray-300'],
      ['Slate', '#4B575B', '--gray-500'],
    ]);
  });

  it('finds supporting colors by id too', () => {
    expect(findColor('light-tint').hex).toBe('#F3FAFC');
    expect(() => findColor('ink')).toThrow();
  });

  it('orders the chart colors the same way everywhere', () => {
    expect(chartColors().map((color) => color.name)).toEqual([
      'Teal',
      'Yellow',
      'Navy',
      'MC Blue',
      'Deep Teal',
      'Gray 300',
    ]);
  });
});
