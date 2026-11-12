import { describe, expect, it } from 'vitest';
import {
  ENDORSEMENT_EXAMPLE,
  HEXAGON_FRAME,
  ICON_SURFACES,
  PARTNER_LOCKUPS,
  PATTERN_COVERS,
  STAT_CALLOUTS,
  SUB_BRAND_LOCKUPS,
  TIMELINE_LINE_HEX,
  TIMELINE_STEP_NAMES,
  exampleContrast,
  hexagonPoints,
  timelineSteps,
} from '../../src/brand/device-examples';
import { PATTERN_COLOR_IDS } from '../../src/studio/patterns';
import { chartColors } from '../../src/brand/palette';

describe('the drawn graphic device examples', () => {
  it('sets every pattern label where it reads on both triangle colors', () => {
    PATTERN_COVERS.forEach((cover) => {
      const backgrounds = cover.panelColorId ? [cover.panelColorId] : PATTERN_COLOR_IDS.triangles;
      backgrounds.forEach((background) =>
        expect(exampleContrast(cover.labelColorId, background)).toBeGreaterThanOrEqual(4.5),
      );
    });
  });

  it('draws the sub-brand lockup with an MC Blue rule on light and Cyan on dark', () => {
    expect(SUB_BRAND_LOCKUPS.map((lockup) => [lockup.surfaceColorId, lockup.ruleColorId])).toEqual([
      ['white', 'mc-blue'],
      ['navy', 'cyan'],
    ]);
    SUB_BRAND_LOCKUPS.forEach((lockup) => {
      expect(lockup.name).toBe(lockup.name.toUpperCase());
      expect(exampleContrast(lockup.textColorId, lockup.surfaceColorId)).toBeGreaterThanOrEqual(
        4.5,
      );
    });
  });

  it('draws the partner lockup rule in MC Gray on light and white on dark', () => {
    expect(PARTNER_LOCKUPS.map((lockup) => [lockup.surfaceColorId, lockup.ruleColorId])).toEqual([
      ['white', 'mc-gray'],
      ['navy', 'white'],
    ]);
  });

  it('writes the endorsement line in capitals', () => {
    expect(ENDORSEMENT_EXAMPLE.endorsement).toBe('WITH MASSCHALLENGE');
  });

  it('uses the approved figures with Teal or Cyan numbers and readable labels', () => {
    expect(STAT_CALLOUTS.map((stat) => stat.value)).toEqual(['90K', '$16B+']);
    expect(STAT_CALLOUTS.map((stat) => stat.numberColorId)).toEqual(['teal', 'cyan']);
    STAT_CALLOUTS.forEach((stat) => {
      expect(stat.numberColorId).not.toBe('raspberry');
      expect(exampleContrast(stat.numberColorId, stat.surfaceColorId)).toBeGreaterThanOrEqual(4.5);
      expect(exampleContrast(stat.labelColorId, stat.surfaceColorId)).toBeGreaterThanOrEqual(4.5);
    });
    expect(STAT_CALLOUTS.filter((stat) => stat.accentRuleColorId)).toHaveLength(1);
  });

  it('colors the timeline dots in the chart order', () => {
    const steps = timelineSteps();
    expect(steps.map((step) => step.name)).toEqual(TIMELINE_STEP_NAMES);
    expect(steps.map((step) => step.hex)).toEqual(chartColors().map((color) => color.hex));
    expect(steps.map((step) => step.isAbove)).toEqual([true, false, true, false, true, false]);
    expect(TIMELINE_LINE_HEX).toBe('#848F92');
  });

  it('puts Teal icons on light and Cyan icons on dark', () => {
    expect(ICON_SURFACES.map((surface) => [surface.surfaceColorId, surface.iconColorId])).toEqual([
      ['white', 'teal'],
      ['navy', 'cyan'],
    ]);
    ICON_SURFACES.forEach((surface) => {
      expect(exampleContrast(surface.iconColorId, surface.surfaceColorId)).toBeGreaterThanOrEqual(
        3,
      );
      expect(exampleContrast(surface.labelColorId, surface.surfaceColorId)).toBeGreaterThanOrEqual(
        4.5,
      );
    });
  });

  it('draws the hexagon frame in MC Blue with light tint lines', () => {
    expect(HEXAGON_FRAME.hexagonColorId).toBe('mc-blue');
    expect(HEXAGON_FRAME.lineColorId).toBe('light-tint');
    expect(hexagonPoints(0, 0, 10).split(' ')).toHaveLength(6);
  });
});
