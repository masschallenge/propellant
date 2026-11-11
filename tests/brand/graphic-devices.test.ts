import { describe, expect, it } from 'vitest';
import { GRAPHIC_DEVICES, findDevice, patternLabelNote } from '../../src/brand/graphic-devices';
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

  it('gives every photo example alt text and no citation', () => {
    Object.values(GRAPHIC_EXAMPLES).forEach((examples) =>
      examples?.forEach((example) => {
        expect(example.alt.split(' ').length).toBeGreaterThan(4);
        expect(example).not.toHaveProperty('page');
      }),
    );
  });

  it('draws the pattern, lockups, stat callouts, timelines and icons from the brand', () => {
    ['pattern', 'program-lockup', 'stat-callout', 'timeline', 'icons'].forEach((id) =>
      expect(GRAPHIC_EXAMPLES).not.toHaveProperty(id),
    );
  });

  it('measures what passes on the pattern', () => {
    expect(patternLabelNote()).toContain('Ink (5.4:1 on Bright teal');
    expect(patternLabelNote()).toContain('White on a solid Deep teal panel (10.7:1)');
    expect(patternLabelNote()).toContain('White on Bright teal is only 2.7:1');
  });

  it('never sets stat numbers in Magenta', () => {
    expect(findDevice('stat-callout').note).toMatch(/Never Magenta/);
  });

  it('describes the icons by style only', () => {
    expect(findDevice('icons').description).toMatch(/^Single color line icons/);
    expect(findDevice('icons').note).toBeUndefined();
  });

  it('never mentions the website or uses em or en dashes', () => {
    const text = JSON.stringify([GRAPHIC_DEVICES, GRAPHIC_EXAMPLES]);
    expect(text).not.toMatch(/[–—]/);
    expect(JSON.stringify(GRAPHIC_DEVICES)).not.toMatch(/website|noun project|crimson|77K/i);
  });
});
