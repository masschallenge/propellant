import { describe, expect, it } from 'vitest';
import {
  GRAPHIC_DEVICES,
  MARKETING_LOCKUP_NOTE,
  findDevice,
  patternLabelNote,
} from '../../src/brand/graphic-devices';

describe('the graphic devices', () => {
  it('covers every device, with the duotone retired and the guide lockups in', () => {
    expect(GRAPHIC_DEVICES.map((device) => device.name)).toEqual([
      'Geometric pattern',
      'Hero overlay',
      'Hexagon network frame',
      'Corporate partner lockup',
      'Sub-brand lockup',
      'Partner initiative endorsement',
      'Stat callouts',
      'Program timelines',
      'Icons',
    ]);
    expect(JSON.stringify(GRAPHIC_DEVICES)).not.toMatch(
      /Teal duotone|Bright teal|Pale teal|Ink|Magenta/,
    );
    expect(() => findDevice('stickers' as never)).toThrow();
  });

  it('measures what passes on the pattern', () => {
    expect(patternLabelNote()).toContain('Black (5.7:1 on MC Blue');
    expect(patternLabelNote()).toContain(
      'White on a solid Navy or Deep Teal panel (15.3:1 and 8.9:1)',
    );
    expect(patternLabelNote()).toContain('White on MC Blue is only 2.8:1');
  });

  it('puts the partner first, with a rule and no plus sign', () => {
    const partner = findDevice('partner-lockup');
    expect(partner.description).toMatch(/partner logo first on the left, a 1pt vertical rule/);
    expect(partner.description).toMatch(/vertical logo on the right/);
    expect(partner.note).toMatch(/Never put MassChallenge first/);
    expect(partner.note).toMatch(/add a plus sign/);
  });

  it('leaves real lockups to MassChallenge Marketing', () => {
    expect(MARKETING_LOCKUP_NOTE).toMatch(/Only MassChallenge Marketing creates/);
    expect(findDevice('sub-brand-lockup').note).toBe(MARKETING_LOCKUP_NOTE);
    expect(findDevice('sub-brand-lockup').use).toMatch(/Partner logos never join/);
    expect(findDevice('partner-endorsement').description).toMatch(/WITH MASSCHALLENGE/);
  });

  it('sets stat numbers in Oswald Bold, never Raspberry', () => {
    expect(findDevice('stat-callout').description).toMatch(/Oswald Bold/);
    expect(findDevice('stat-callout').note).toMatch(/Teal on light backgrounds and Cyan on dark/);
    expect(findDevice('stat-callout').note).toMatch(/Never Raspberry for numbers/);
  });

  it('describes the icons by style only', () => {
    expect(findDevice('icons').description).toMatch(/^Single color line icons/);
    expect(findDevice('icons').description).toMatch(/Teal on light backgrounds and Cyan on dark/);
    expect(findDevice('icons').note).toBeUndefined();
  });

  it('never mentions the website or uses em or en dashes', () => {
    const text = JSON.stringify(GRAPHIC_DEVICES);
    expect(text).not.toMatch(/[–—]/);
    expect(text).not.toMatch(/website|noun project|crimson|77K/i);
  });
});
