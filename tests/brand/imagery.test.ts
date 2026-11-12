import { describe, expect, it } from 'vitest';
import {
  ACCENT_RESCUE_IDS,
  HERO_OVERLAY,
  IMAGE_TREATMENTS,
  LOWER_THIRD,
  PHOTO_GUIDANCE,
  VIDEO_GUIDANCE,
  applyHeroOverlay,
  clampOverlayOpacity,
  heroOverlayCss,
  overlayColorAt,
  overlayPixel,
} from '../../src/brand/imagery';
import { findColor, isWarmAccent } from '../../src/brand/palette';

const guidance = (id: string) =>
  PHOTO_GUIDANCE.find((group) => group.id === id)?.items.join(' ') ?? '';

describe('image treatments', () => {
  it('offers the three treatments from the guide, and no duotone', () => {
    expect(IMAGE_TREATMENTS.map((treatment) => `${treatment.number} ${treatment.name}`)).toEqual([
      '01 Overlay',
      '02 Full color',
      '03 Accent rescue',
    ]);
    IMAGE_TREATMENTS.forEach((treatment) => expect(treatment.id).not.toMatch(/duotone/));
  });

  it('rescues a cool photo with one warm accent', () => {
    expect(ACCENT_RESCUE_IDS).toEqual(['yellow', 'orange', 'lime']);
    ACCENT_RESCUE_IDS.forEach((id) => expect(isWarmAccent(id)).toBe(true));
  });
});

describe('the hero overlay', () => {
  it('runs from Navy-black to Ocean at 15 to 30% opacity', () => {
    expect(HERO_OVERLAY).toEqual({
      fromHex: '#051925',
      toHex: findColor('ocean').hex,
      minimumOpacity: 0.15,
      maximumOpacity: 0.3,
    });
    expect(clampOverlayOpacity(0.6)).toBe(0.3);
    expect(clampOverlayOpacity(0.05)).toBe(0.15);
  });

  it('writes the CSS gradient from the text side toward the subject', () => {
    expect(heroOverlayCss('left', 0.2)).toBe(
      'linear-gradient(90deg, rgb(5 25 37 / 0.2), rgb(3 122 166 / 0.2))',
    );
    expect(heroOverlayCss('bottom')).toMatch(/^linear-gradient\(0deg/);
  });

  it('blends the overlay color at the right point of the gradient', () => {
    expect(overlayColorAt(0)).toEqual([5, 25, 37]);
    expect(overlayColorAt(1)).toEqual([3, 122, 166]);
    expect(overlayPixel(255, 255, 255, 0, 0.3)).toEqual([180, 186, 190]);
  });

  it('keeps the subject side lighter than the text side', () => {
    const pixels = [200, 200, 200, 255, 200, 200, 200, 255];
    applyHeroOverlay(pixels, 2, 1, 'left');
    const brightness = (offset: number) => pixels[offset] + pixels[offset + 1] + pixels[offset + 2];
    expect(brightness(4)).toBeGreaterThan(brightness(0));
    expect(pixels[3]).toBe(255);
  });
});

describe('photography guidance', () => {
  it('asks for warmth, real work and light editing', () => {
    expect(guidance('show')).toMatch(/warmth/);
    expect(guidance('shoot')).toMatch(/Shoot RAW/);
    expect(guidance('shoot')).toMatch(/no black and white/);
  });

  it('lists what to avoid, including AI images and the retired duotone', () => {
    const avoid = guidance('avoid');
    ['phones', 'alcohol', 'Crowds from behind', 'Generic stock', 'AI generated', 'duotone'].forEach(
      (word) => expect(avoid).toContain(word),
    );
  });

  it('allows licensed stock without saying which or where', () => {
    const sources = guidance('sources');
    expect(sources).toMatch(/Licensed stock photography that MassChallenge holds a license for/);
    expect(sources).toMatch(/Ask MassChallenge Marketing/);
    expect(sources).not.toMatch(/sharepoint|adobe|folder|library/i);
  });
});

describe('video guidance', () => {
  it('sets the lower thirds, slates and approval', () => {
    const video = VIDEO_GUIDANCE.flatMap((group) => group.items).join(' ');
    expect(video).toMatch(/standard logo open and end slates/);
    expect(video).toMatch(/approved by MassChallenge Marketing/);
    expect(video).toMatch(/rule of thirds/);
    expect([LOWER_THIRD.blockId, LOWER_THIRD.ruleId]).toEqual(['navy', 'cyan']);
    expect(LOWER_THIRD.nameStyle).toBe('Oswald SemiBold');
  });
});
