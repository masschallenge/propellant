import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  MINIMUM_LARGE_CONTRAST,
  MINIMUM_TEXT_CONTRAST,
  contrastRatio,
  formatRgb,
  hexToRgb,
  isDark,
  mostReadable,
  pairingLevel,
} from '../../src/brand/contrast';
import { BRAND_COLORS, findColor } from '../../src/brand/palette';

describe('contrast', () => {
  it('reads six and three digit hex colors', () => {
    expect(hexToRgb('#065E6F')).toEqual({ red: 6, green: 94, blue: 111 });
    expect(hexToRgb('fff')).toEqual({ red: 255, green: 255, blue: 255 });
    expect(formatRgb('#FFC801')).toBe('rgb(255, 200, 1)');
    expect(() => hexToRgb('#12')).toThrow();
  });

  it('matches the WCAG contrast ratio for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('grades against the WCAG 2.2 AA contrast minimums and says so on the color guide', () => {
    expect(MINIMUM_TEXT_CONTRAST).toBe(4.5);
    expect(MINIMUM_LARGE_CONTRAST).toBe(3);
    const colorGuide = readFileSync('src/components/brand/sections/Color.astro', 'utf8');
    expect(colorGuide).toMatch(/graded against WCAG 2\.2/);
  });

  it('sorts pairings into any text, large text only and never', () => {
    expect(pairingLevel('#FFFFFF', '#044451')).toBe('any');
    expect(pairingLevel('#FFFFFF', '#0FACBD')).toBe('never');
    expect(pairingLevel('#068DA4', '#FFFFFF')).toBe('large');
  });

  it('knows which backgrounds are dark and picks the most readable text', () => {
    expect(isDark('#044451')).toBe(true);
    expect(isDark('#FFC801')).toBe(false);
    expect(mostReadable('#FFC801', ['#FFFFFF', '#1E282B'])).toBe('#1E282B');
  });
});

describe('palette', () => {
  it('has a unique id and a valid hex for every color', () => {
    const ids = BRAND_COLORS.map((color) => color.id);
    expect(new Set(ids).size).toBe(ids.length);
    BRAND_COLORS.forEach((color) => expect(() => hexToRgb(color.hex)).not.toThrow());
  });

  it('finds colors by id and refuses unknown ones', () => {
    expect(findColor('teal').hex).toBe('#00708E');
    expect(() => findColor('purple')).toThrow();
  });
});
