import { describe, expect, it } from 'vitest';
import {
  GRAPHIC_DEVICES,
  OFF_PALETTE_MAPPINGS,
  findDevice,
  patternLabelNote,
} from '../../src/brand/graphic-devices';
import { GRAPHIC_EXAMPLES } from '../../src/brand/graphic-examples';

describe('the graphic devices', () => {
  it('covers every device in the standard', () => {
    expect(GRAPHIC_DEVICES.map((device) => device.name)).toEqual([
      'Geometric pattern',
      'Teal duotone',
      'Hexagon network frame',
      'Co-brand lockup',
      'Program lockup',
      'Stat callouts',
      'Program timelines',
      'Icons',
    ]);
    expect(() => findDevice('stickers' as never)).toThrow();
  });

  it('hotlinks every example from masschallenge.org with alt text and its page', () => {
    Object.values(GRAPHIC_EXAMPLES).forEach((examples) =>
      examples?.forEach((example) => {
        expect(example.src).toMatch(/^https:\/\/masschallenge\.org\/wp-content\/uploads\//);
        expect(example.page).toMatch(/^https:\/\/masschallenge\.org\//);
        expect(example.alt.split(' ').length).toBeGreaterThan(4);
      }),
    );
    expect(GRAPHIC_EXAMPLES.pattern).toHaveLength(2);
  });

  it('measures why the white pattern label fails and what passes', () => {
    expect(patternLabelNote()).toContain('White on Bright teal is only 2.7:1');
    expect(patternLabelNote()).toContain('Ink (5.4:1 on Bright teal');
  });

  it('never maps stat numbers to Magenta', () => {
    const stats = OFF_PALETTE_MAPPINGS.find((mapping) => mapping.where === 'Stat numbers');
    expect(stats?.useInstead).toMatch(/^Deep teal on light, Bright teal on dark/);
    expect(findDevice('stat-callout').note).toMatch(/Never Magenta/);
  });

  it('flags the icon licence as unknown', () => {
    expect(findDevice('icons').note).toMatch(/not known/);
  });

  it('never uses em or en dashes', () => {
    const text = JSON.stringify([GRAPHIC_DEVICES, OFF_PALETTE_MAPPINGS, GRAPHIC_EXAMPLES]);
    expect(text).not.toMatch(/[–—]/);
  });
});
