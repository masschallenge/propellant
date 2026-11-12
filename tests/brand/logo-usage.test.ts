import { describe, expect, it } from 'vitest';
import {
  LOGO_ASPECT,
  LOGO_BACKGROUNDS,
  LOGO_LOCKUPS,
  LOGO_NEVER,
  LOGO_TREATMENTS,
  LOGO_VERSIONS,
  MARKETING_FILES_NOTE,
  NO_WHITE_LOGO_BACKGROUND_IDS,
  WORDMARK_M_SHARE,
  clearSpaceFor,
  findBackground,
  findLockup,
  findTreatment,
  isBelowMinimum,
  logoFileName,
  logoWidthFor,
  minimumLabel,
  suitsBackground,
  treatmentFor,
} from '../../src/brand/logo-usage';

describe('logo versions', () => {
  it('makes vertical the default and ships only horizontal and the MC mark', () => {
    expect(LOGO_VERSIONS.map((version) => [version.id, version.isShipped])).toEqual([
      ['vertical', false],
      ['horizontal', true],
      ['monogram', true],
      ['local', false],
    ]);
    expect(LOGO_VERSIONS[0].use).toMatch(/default for most layouts/);
    expect(MARKETING_FILES_NOTE).toMatch(
      /Vertical and local logo files come from MassChallenge Marketing/,
    );
  });

  it('gives the screen and print minimums from the guide', () => {
    const minimums = Object.fromEntries(
      LOGO_VERSIONS.map((version) => [version.id, [version.screenMinimum, version.printMinimum]]),
    );
    expect(minimums.vertical).toEqual(['60px wide', '20mm wide']);
    expect(minimums.horizontal).toEqual(['160px wide', '30mm wide']);
    expect(minimums.monogram).toEqual(['16px tall', '8mm']);
  });

  it('lists the approved local logos and forbids typing a location', () => {
    const local = LOGO_VERSIONS.find((version) => version.id === 'local');
    expect(local?.use).toMatch(/Boston, Israel, UK and Switzerland/);
    expect(local?.use).toMatch(/Never type a location next to the logo/);
  });
});

describe('logo backgrounds', () => {
  it('offers the backgrounds the guide allows, in order', () => {
    expect(LOGO_BACKGROUNDS.map((background) => background.name)).toEqual([
      'White',
      'Warm White',
      'Navy',
      'Black',
      'Deep Teal',
      'Teal',
      'MC Blue',
      'On a photo',
    ]);
  });

  it('puts the full color logo on White or Warm White only', () => {
    ['white', 'warm-white'].forEach((id) => expect(treatmentFor(findBackground(id))).toBe('color'));
  });

  it('puts the white logo on Navy, Black, Deep Teal, Teal, MC Blue and photos', () => {
    ['navy', 'black', 'deep-teal', 'teal', 'mc-blue', 'photo'].forEach((id) => {
      expect(treatmentFor(findBackground(id))).toBe('white');
    });
  });

  it('never offers the white logo on light colors', () => {
    expect(NO_WHITE_LOGO_BACKGROUND_IDS).toEqual(['cyan', 'yellow', 'lime']);
    NO_WHITE_LOGO_BACKGROUND_IDS.forEach((id) => expect(() => findBackground(id)).toThrow());
    expect(findTreatment('white').useOn).toMatch(
      /Never on light colors such as Cyan, Yellow or Lime/,
    );
  });

  it('judges whether a chosen treatment suits a background', () => {
    expect(suitsBackground('color', findBackground('teal'))).toBe(false);
    expect(suitsBackground('color', findBackground('mc-blue'))).toBe(false);
    expect(suitsBackground('white', findBackground('white'))).toBe(false);
    expect(suitsBackground('black', findBackground('warm-white'))).toBe(true);
    expect(suitsBackground('black', findBackground('photo'))).toBe(false);
    expect(suitsBackground('white', findBackground('photo'))).toBe(true);
  });

  it('keeps the black logo for one color print', () => {
    expect(findTreatment('black').useOn).toMatch(/One color print/);
  });
});

describe('logo size and space', () => {
  it('sets clear space to the height of the M in the wordmark', () => {
    expect(WORDMARK_M_SHARE).toBeCloseTo(0.404, 3);
    expect(clearSpaceFor('horizontal', 225)).toBeCloseTo(91);
    expect(clearSpaceFor('horizontal', 45)).toBeCloseTo(18.2);
  });

  it('keeps the MC mark clear space at half its height', () => {
    expect(clearSpaceFor('monogram', 32)).toBe(16);
  });

  it('measures the horizontal minimum by width and the MC mark by height', () => {
    expect(findLockup('horizontal').minimumWidth).toBe(160);
    expect(findLockup('horizontal').minimumHeight).toBe(22);
    expect(findLockup('monogram').minimumHeight).toBe(16);
    expect(minimumLabel(findLockup('horizontal'))).toBe('160px wide');
    expect(minimumLabel(findLockup('monogram'))).toBe('16px tall');
    expect(logoWidthFor('horizontal', 24)).toBeCloseTo(178.2, 1);
    expect(isBelowMinimum('horizontal', 24)).toBe(false);
    expect(isBelowMinimum('horizontal', 22)).toBe(false);
    expect(isBelowMinimum('horizontal', 21)).toBe(true);
    expect(isBelowMinimum('monogram', 16)).toBe(false);
    expect(isBelowMinimum('monogram', 15)).toBe(true);
    expect(logoWidthFor('monogram', 16)).toBeGreaterThanOrEqual(24);
  });

  it('knows the proportions of the shipped files', () => {
    expect(LOGO_ASPECT.horizontal).toBeCloseTo(1671 / 225);
    expect(LOGO_ASPECT.monogram).toBeCloseTo(321 / 177);
  });
});

describe('logo files and misuse', () => {
  it('names the files the package ships', () => {
    expect(logoFileName('monogram', 'white')).toBe('masschallenge-logo-monogram-white.png');
    expect(LOGO_LOCKUPS).toHaveLength(2);
    expect(LOGO_TREATMENTS.map((treatment) => treatment.id)).toEqual(['color', 'white', 'black']);
  });

  it('lists everything the guide forbids', () => {
    const never = LOGO_NEVER.join(' ').toLowerCase();
    [
      'recolor',
      'stretch',
      'rotate',
      'outline',
      'effects',
      'flip',
      'crop',
      'rearrange',
      'rebuild',
      'retype',
      'lockups',
    ].forEach((word) => expect(never).toContain(word));
  });

  it('throws on unknown ids', () => {
    expect(() => findBackground('plaid')).toThrow();
    expect(() => findLockup('stacked' as 'horizontal')).toThrow();
    expect(() => findTreatment('gold' as 'color')).toThrow();
  });
});
