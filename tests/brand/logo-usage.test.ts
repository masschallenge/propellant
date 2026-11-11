import { describe, expect, it } from 'vitest';
import {
  LOGO_BACKGROUNDS,
  LOGO_LOCKUPS,
  LOGO_TREATMENTS,
  clearSpaceFor,
  findBackground,
  findLockup,
  findTreatment,
  isBelowMinimum,
  logoFileName,
  suitsBackground,
  treatmentFor,
} from '../../src/brand/logo-usage';

describe('logo usage', () => {
  it('offers the backgrounds the guide shows, in order', () => {
    expect(LOGO_BACKGROUNDS.map((background) => background.name)).toEqual([
      'White',
      'Mist',
      'Pale teal',
      'Deep teal',
      'Teal',
      'Ink',
      'On a photo',
    ]);
  });

  it('picks full color on light backgrounds', () => {
    ['white', 'mist', 'pale-teal'].forEach((id) => {
      expect(treatmentFor(findBackground(id))).toBe('color');
    });
  });

  it('picks white on teal, dark backgrounds and photos', () => {
    ['deep-teal', 'teal', 'ink', 'photo'].forEach((id) => {
      expect(treatmentFor(findBackground(id))).toBe('white');
    });
  });

  it('judges whether a chosen treatment suits a background', () => {
    expect(suitsBackground('color', findBackground('teal'))).toBe(false);
    expect(suitsBackground('white', findBackground('white'))).toBe(false);
    expect(suitsBackground('black', findBackground('mist'))).toBe(true);
    expect(suitsBackground('black', findBackground('photo'))).toBe(false);
    expect(suitsBackground('white', findBackground('photo'))).toBe(true);
  });

  it('keeps clear space at half the logo height', () => {
    expect(clearSpaceFor(32)).toBe(16);
    expect(clearSpaceFor(25)).toBe(12.5);
  });

  it('warns below the minimum heights from the reference', () => {
    expect(findLockup('horizontal').minimumHeight).toBe(24);
    expect(findLockup('monogram').minimumHeight).toBe(16);
    expect(isBelowMinimum('horizontal', 23)).toBe(true);
    expect(isBelowMinimum('horizontal', 24)).toBe(false);
    expect(isBelowMinimum('monogram', 16)).toBe(false);
    expect(isBelowMinimum('monogram', 15)).toBe(true);
  });

  it('names the files the package ships', () => {
    expect(logoFileName('monogram', 'white')).toBe('masschallenge-logo-monogram-white.png');
    expect(LOGO_LOCKUPS).toHaveLength(2);
    expect(LOGO_TREATMENTS.map((treatment) => treatment.id)).toEqual(['color', 'white', 'black']);
  });

  it('throws on unknown ids', () => {
    expect(() => findBackground('plaid')).toThrow();
    expect(() => findLockup('stacked' as 'horizontal')).toThrow();
    expect(() => findTreatment('gold' as 'color')).toThrow();
  });
});
