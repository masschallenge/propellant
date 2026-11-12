import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  COLOR_BALANCE,
  hasOneWarmAccentAtMost,
  warmAccentsIn,
} from '../../src/brand/color-balance';

describe('color balance', () => {
  it('states the qualitative rules from the guide, with no shares', () => {
    expect(COLOR_BALANCE.map((rule) => rule.id)).toEqual(['carry', 'small-doses', 'one-accent']);
    COLOR_BALANCE.forEach((rule) => expect(rule.text).not.toMatch(/\d+\s*%|percent/));
    expect(readFileSync('src/brand/color-balance.ts', 'utf8')).not.toMatch(/share/);
  });

  it('lets Navy, Black and the blues carry the layout', () => {
    const carry = COLOR_BALANCE[0].colors.map((color) => color.name);
    expect(carry.slice(0, 3)).toEqual(['Navy', 'Black', 'Deep Teal']);
    expect(carry).not.toContain('Yellow');
  });

  it('keeps the warm accents to small doses', () => {
    expect(COLOR_BALANCE[1].colors.map((color) => color.name)).toEqual([
      'Yellow',
      'Orange',
      'Raspberry',
      'Lime',
    ]);
  });

  it('allows one warm accent per piece', () => {
    expect(warmAccentsIn(['navy', 'yellow', 'white']).map((color) => color.id)).toEqual(['yellow']);
    expect(hasOneWarmAccentAtMost(['navy', 'yellow'])).toBe(true);
    expect(hasOneWarmAccentAtMost(['navy', 'teal'])).toBe(true);
    expect(hasOneWarmAccentAtMost(['yellow', 'lime'])).toBe(false);
  });
});
