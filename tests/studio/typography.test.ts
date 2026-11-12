import { describe, expect, it } from 'vitest';
import { POST_FORMATS, findFormat, formatSizeLabel } from '../../src/studio/formats';
import {
  SIZE_STEPS,
  TEXT_ROLES,
  canvasScale,
  fontPixels,
  fontString,
  isLargeText,
  linePixels,
  nearestAllowedSize,
  requiredContrast,
} from '../../src/studio/typography';

describe('formats', () => {
  it('has the real pixel sizes', () => {
    expect(POST_FORMATS.map((format) => [format.name, format.width, format.height])).toEqual([
      ['Instagram post 4:5', 1080, 1350],
      ['Instagram square', 1080, 1080],
      ['Story 9:16', 1080, 1920],
      ['LinkedIn post', 1200, 627],
      ['Event banner 16:9', 1920, 1080],
    ]);
    expect(formatSizeLabel(findFormat('story'))).toBe('1080 x 1920 px');
    expect(() => findFormat('poster')).toThrow();
  });
});

describe('typography', () => {
  it('maps size steps to the token scale', () => {
    expect(SIZE_STEPS.map((step) => step.token)).toContain('--type-display-size');
    expect(canvasScale(findFormat('instagram-post'))).toBe(3);
    expect(fontPixels('display', findFormat('instagram-post'))).toBe(120);
    expect(fontString('headline', 'display', findFormat('instagram-post'))).toContain('Oswald');
  });

  it('gives Oswald display sizes only and capitals always', () => {
    const oswald = TEXT_ROLES.find((role) => role.id === 'headline');
    expect(oswald?.capitals).toBe('always');
    expect(oswald?.sizes).toEqual(['display', 'heading-1', 'heading-2']);
    expect(TEXT_ROLES.filter((role) => role.capitals === 'never')).toHaveLength(2);
    expect(nearestAllowedSize('headline', 'small')).toBe('heading-2');
    expect(nearestAllowedSize('body', 'display')).toBe('lead');
  });

  it('sets headlines in Oswald SemiBold at line height 1.0 with Aptos fallbacks, never Arial', () => {
    const format = findFormat('instagram-post');
    expect(fontString('headline', 'display', format)).toBe(
      "600 120px 'Oswald', 'Aptos Narrow', sans-serif",
    );
    expect(fontString('body', 'body', format)).toContain("'Lato', 'Aptos', sans-serif");
    TEXT_ROLES.forEach((role) => expect(role.family).not.toMatch(/arial/i));
    expect(linePixels('display', format, 'headline')).toBe(120);
    expect(linePixels('display', format)).toBe(132);
  });

  it('uses 3:1 for large text and 4.5:1 for the rest', () => {
    expect(isLargeText('headline', 'heading-2')).toBe(true);
    expect(isLargeText('bold', 'heading-3')).toBe(true);
    expect(isLargeText('body', 'lead')).toBe(false);
    expect(requiredContrast('headline', 'display')).toBe(3);
    expect(requiredContrast('bold', 'lead')).toBe(4.5);
  });
});
