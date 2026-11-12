import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/brand/contrast';
import { findColor } from '../../src/brand/palette';
import {
  APPROVED_PAIRINGS,
  FAILING_PAIRINGS,
  VERIFIED_PAIRINGS,
  contrastScores,
  formatGuideRatio,
  formatRatio,
  resolvePairings,
  wcagGrade,
} from '../../src/brand/pairings';

const summary = (specs: typeof APPROVED_PAIRINGS) =>
  resolvePairings(specs).map(
    (pairing) => `${pairing.foreground.name} on ${pairing.background.name} ${pairing.label}`,
  );

describe('pairings', () => {
  it('formats ratios without rounding up', () => {
    expect(formatRatio(21)).toBe('21:1');
    expect(formatRatio(4.4999)).toBe('4.4:1');
    expect(formatRatio(7.46)).toBe('7.4:1');
    expect(formatRatio(1)).toBe('1:1');
  });

  it('formats guide ratios to one decimal, as the guide prints them', () => {
    expect(formatGuideRatio(10.978)).toBe('11.0:1');
    expect(formatGuideRatio(5.663)).toBe('5.7:1');
  });

  it('grades ratios in words', () => {
    expect(wcagGrade(4.5)).toBe('AA');
    expect(wcagGrade(3)).toBe('AA Large');
    expect(wcagGrade(2.99)).toBe('Fail');
  });

  it('scores a color against White and Black', () => {
    const scores = contrastScores(findColor('teal').hex);
    expect(scores.map((score) => score.against)).toEqual(['White', 'Black']);
    expect(scores[0].grade).toBe('AA');
    expect(scores[0].ratio).toBeCloseTo(contrastRatio('#00708E', '#FFFFFF'), 5);
  });

  it('matches the approved pairings and ratios in the brand guide', () => {
    expect(summary(APPROVED_PAIRINGS)).toEqual([
      'Cyan on Navy 11.0:1',
      'White on Black 15.9:1',
      'Teal on White 5.7:1',
      'White on Deep Teal 8.9:1',
      'Navy on Warm White 14.4:1',
      'Lime on Navy 11.7:1',
    ]);
    resolvePairings(APPROVED_PAIRINGS).forEach((pairing) => expect(pairing.grade).toBe('AA'));
  });

  it('matches the verified extras', () => {
    expect(summary(VERIFIED_PAIRINGS)).toEqual([
      'White on Teal 5.7:1',
      'Black on Yellow 10.2:1',
      'Black on Orange 5.6:1',
      'White on Navy 15.3:1',
      'Cyan on Deep Teal 6.4:1',
    ]);
  });

  it('lists the pairings that fail for text', () => {
    expect(summary(FAILING_PAIRINGS)).toEqual([
      'White on MC Blue 2.8:1',
      'MC Blue on White 2.8:1',
      'Teal on Navy 2.7:1',
      'White on Orange 2.8:1',
    ]);
    resolvePairings(FAILING_PAIRINGS).forEach((pairing) => expect(pairing.grade).toBe('Fail'));
  });
});
