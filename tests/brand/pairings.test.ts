import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/brand/contrast';
import { BRAND_COLORS, findColor } from '../../src/brand/palette';
import { contrastScores, formatRatio, pairingsOn, wcagGrade } from '../../src/brand/pairings';

describe('pairings', () => {
  it('formats ratios without rounding up', () => {
    expect(formatRatio(21)).toBe('21:1');
    expect(formatRatio(4.4999)).toBe('4.4:1');
    expect(formatRatio(7.46)).toBe('7.4:1');
    expect(formatRatio(1)).toBe('1:1');
  });

  it('grades ratios in words', () => {
    expect(wcagGrade(4.5)).toBe('AA');
    expect(wcagGrade(3)).toBe('AA Large');
    expect(wcagGrade(2.99)).toBe('Fail');
  });

  it('scores a color against white and ink', () => {
    const scores = contrastScores(findColor('teal').hex);
    expect(scores.map((score) => score.against)).toEqual(['White', 'Ink']);
    expect(scores[0].grade).toBe('AA');
    expect(scores[0].ratio).toBeCloseTo(contrastRatio('#065E6F', '#FFFFFF'), 5);
  });

  it('sorts every other color into one group per background', () => {
    BRAND_COLORS.forEach((background) => {
      const groups = pairingsOn(background);
      const listed = [...groups.any, ...groups.large, ...groups.never];
      expect(listed).toHaveLength(BRAND_COLORS.length - 1);
      expect(listed.some((pairing) => pairing.color.id === background.id)).toBe(false);
      groups.any.forEach((pairing) => expect(pairing.ratio).toBeGreaterThanOrEqual(4.5));
      groups.large.forEach((pairing) => {
        expect(pairing.ratio).toBeGreaterThanOrEqual(3);
        expect(pairing.ratio).toBeLessThan(4.5);
      });
      groups.never.forEach((pairing) => expect(pairing.ratio).toBeLessThan(3));
    });
  });

  it('matches known pairings', () => {
    const onDeepTeal = pairingsOn(findColor('deep-teal'));
    expect(onDeepTeal.any.map((pairing) => pairing.color.id)).toContain('white');
    expect(onDeepTeal.large.map((pairing) => pairing.color.id)).toContain('bright-teal');
    expect(onDeepTeal.never.map((pairing) => pairing.color.id)).toContain('teal');
    const onYellow = pairingsOn(findColor('yellow'));
    expect(onYellow.any.map((pairing) => pairing.color.id)).toContain('ink');
    expect(onYellow.never.map((pairing) => pairing.color.id)).toContain('white');
  });

  it('lists the strongest pairings first', () => {
    const groups = pairingsOn(findColor('white'));
    const ratios = groups.any.map((pairing) => pairing.ratio);
    expect([...ratios].sort((first, second) => second - first)).toEqual(ratios);
  });
});
