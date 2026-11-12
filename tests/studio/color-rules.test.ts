import { describe, expect, it } from 'vitest';
import {
  BACKGROUND_COLOR_IDS,
  backgroundColors,
  shapeNeedsDark,
  shapeReservation,
  textReservation,
} from '../../src/studio/colorRules';
import { isWarmAccent } from '../../src/brand/palette';

describe('studio color rules', () => {
  it('offers White and Warm White for light, and Navy, Black and Deep Teal for dark', () => {
    expect(backgroundColors().map((color) => color.name)).toEqual([
      'White',
      'Warm White',
      'Navy',
      'Black',
      'Deep Teal',
    ]);
    BACKGROUND_COLOR_IDS.forEach((id) => expect(isWarmAccent(id)).toBe(false));
  });

  it('keeps MC Blue, MC Gray, Ocean and the text-free accents out of text', () => {
    ['mc-blue', 'mc-gray', 'ocean', 'yellow', 'orange', 'raspberry'].forEach((id) =>
      expect(textReservation(id)).not.toBeNull(),
    );
    ['black', 'white', 'teal', 'navy'].forEach((id) => expect(textReservation(id)).toBeNull());
  });

  it('allows Cyan and Lime text on dark backgrounds only', () => {
    expect(textReservation('cyan', ['navy'])).toBeNull();
    expect(textReservation('lime', ['black', 'deep-teal'])).toBeNull();
    expect(textReservation('cyan', ['white'])).toBe('Cyan only goes on Navy, Black or Deep Teal.');
    expect(textReservation('cyan', ['navy', 'white'])).not.toBeNull();
    expect(textReservation('cyan', null)).toBeNull();
  });

  it('keeps MC Gray and Ocean out of shapes, and Raspberry, Cyan and Lime shapes on dark', () => {
    expect(shapeReservation('mc-gray')).not.toBeNull();
    expect(shapeReservation('ocean')).not.toBeNull();
    expect(shapeReservation('mc-blue')).toBeNull();
    expect(shapeNeedsDark('raspberry', ['white'])).toBe(true);
    expect(shapeNeedsDark('raspberry', ['navy'])).toBe(false);
    expect(shapeNeedsDark('yellow', ['white'])).toBe(false);
  });
});
