import { describe, expect, it } from 'vitest';
import {
  ICON_SURFACES,
  PATTERN_COVERS,
  PROGRAM_LOCKUPS,
  STAT_CALLOUTS,
  TIMELINE_LINE_HEX,
  TIMELINE_STEP_NAMES,
  exampleContrast,
  timelineSteps,
} from '../../src/brand/device-examples';
import { chartColors } from '../../src/brand/palette';

describe('the drawn graphic device examples', () => {
  it('sets every pattern label where it reads on both triangle colors', () => {
    PATTERN_COVERS.forEach((cover) => {
      const backgrounds = cover.panelColorId ? [cover.panelColorId] : ['bright-teal', 'pale-teal'];
      backgrounds.forEach((background) =>
        expect(exampleContrast(cover.labelColorId, background)).toBeGreaterThanOrEqual(4.5),
      );
    });
  });

  it('draws the program lockup on brand surfaces with a readable name and divider', () => {
    expect(PROGRAM_LOCKUPS.map((lockup) => lockup.surfaceColorId)).toEqual(['white', 'deep-teal']);
    PROGRAM_LOCKUPS.forEach((lockup) => {
      expect(lockup.name).toBe(lockup.name.toUpperCase());
      expect(exampleContrast(lockup.nameColorId, lockup.surfaceColorId)).toBeGreaterThanOrEqual(
        4.5,
      );
      expect(exampleContrast(lockup.dividerColorId, lockup.surfaceColorId)).toBeGreaterThanOrEqual(
        3,
      );
    });
  });

  it('uses the approved figures with teal numbers and readable labels', () => {
    expect(STAT_CALLOUTS.map((stat) => stat.value)).toEqual(['90K', '$16B+']);
    STAT_CALLOUTS.forEach((stat) => expect(stat.asOf).toBe('As of November 2026'));
    STAT_CALLOUTS.forEach((stat) => {
      expect(['deep-teal', 'bright-teal']).toContain(stat.numberColorId);
      expect(exampleContrast(stat.numberColorId, stat.surfaceColorId)).toBeGreaterThanOrEqual(3);
      expect(exampleContrast(stat.labelColorId, stat.surfaceColorId)).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('colors the timeline dots in the chart order', () => {
    const steps = timelineSteps();
    expect(steps.map((step) => step.name)).toEqual(TIMELINE_STEP_NAMES);
    expect(steps.map((step) => step.hex)).toEqual(chartColors().map((color) => color.hex));
    expect(steps.map((step) => step.isAbove)).toEqual([true, false, true, false, true, false]);
    expect(TIMELINE_LINE_HEX).toBe('#848F92');
  });

  it('puts Teal icons on light and Bright teal icons on dark', () => {
    expect(ICON_SURFACES).toEqual([
      { surfaceColorId: 'white', iconColorId: 'teal' },
      { surfaceColorId: 'deep-teal', iconColorId: 'bright-teal' },
    ]);
    ICON_SURFACES.forEach((surface) =>
      expect(exampleContrast(surface.iconColorId, surface.surfaceColorId)).toBeGreaterThanOrEqual(
        3,
      ),
    );
  });
});
