import { contrastRatio } from './contrast';
import { formatGuideRatio } from './pairings';
import { findColor } from './palette';

export type GraphicDeviceId =
  | 'pattern'
  | 'hero-overlay'
  | 'hexagon-frame'
  | 'partner-lockup'
  | 'sub-brand-lockup'
  | 'partner-endorsement'
  | 'stat-callout'
  | 'timeline'
  | 'icons';

export interface GraphicDevice {
  id: GraphicDeviceId;
  name: string;
  description: string;
  use: string;
  note?: string;
}

export const MARKETING_LOCKUP_NOTE =
  'Only MassChallenge Marketing creates sub-brand lockups, partner lockups and endorsement marks. Propellant documents the structure; the example here is a diagram, not artwork to copy.';

const ratioText = (foreground: string, background: string): string =>
  formatGuideRatio(contrastRatio(findColor(foreground).hex, findColor(background).hex));

export const patternLabelNote = (): string =>
  `Set the label in Black (${ratioText('black', 'mc-blue')} on MC Blue, ${ratioText('black', 'light-tint')} on the light tint), or in White on a solid Navy or Deep Teal panel (${ratioText('white', 'navy')} and ${ratioText('white', 'deep-teal')}). Never set it in White straight on the triangles: White on MC Blue is only ${ratioText('white', 'mc-blue')}, below the 3:1 that even large text needs.`;

export const GRAPHIC_DEVICES: GraphicDevice[] = [
  {
    id: 'pattern',
    name: 'Geometric pattern',
    description:
      'MC Blue triangles with a scatter of light tint triangles, and an Oswald label in capitals on top, such as ACCELERATOR or CHALLENGE.',
    use: 'Covers and headers for a program or a page.',
    note: patternLabelNote(),
  },
  {
    id: 'hero-overlay',
    name: 'Hero overlay',
    description:
      'A thin linear gradient over a photo, from Navy-black on the text side to Ocean toward the subject, at 15 to 30% opacity. It replaces the retired teal duotone.',
    use: 'Heroes, social posts and event graphics.',
    note: 'Keep it light enough that warm light glows through. If warm areas go gray or blue, it is too heavy.',
  },
  {
    id: 'hexagon-frame',
    name: 'Hexagon network frame',
    description:
      'A circular photo crop inside a network of MC Blue hexagons joined by lines in the light tint.',
    use: 'A single photo beside text.',
  },
  {
    id: 'partner-lockup',
    name: 'Corporate partner lockup',
    description:
      'For a challenge program a partner commissions: the partner logo first on the left, a 1pt vertical rule a little taller than the logos, then the MassChallenge vertical logo on the right, at equal visual weight.',
    use: 'Work for a corporate partner program, when the partnership agreement allows the partner logo beside ours.',
    note: 'The gap on each side of the rule equals the height of the M in the MC mark. The rule is MC Gray on light, and white or light gray on dark. Both logos are full color on white, or both white on dark or on the partner brand color. Never put MassChallenge first, mix a full color logo with a white one, let one overpower the other, drop the rule or add a plus sign.',
  },
  {
    id: 'sub-brand-lockup',
    name: 'Sub-brand lockup',
    description:
      'For programs MassChallenge runs under its own name: the MC mark, an MC Blue rule (Cyan on dark), the program name in Oswald SemiBold and the location in tracked Oswald Regular.',
    use: 'A named MassChallenge program. Partner logos never join a sub-brand lockup.',
    note: MARKETING_LOCKUP_NOTE,
  },
  {
    id: 'partner-endorsement',
    name: 'Partner initiative endorsement',
    description:
      'For programs partners own and run with MassChallenge guidance: the initiative name above a 1pt rule, with the endorsement line below, such as WITH MASSCHALLENGE or WITH PARTNER & MASSCHALLENGE, left aligned.',
    use: 'Partner initiatives that MassChallenge guides.',
    note: MARKETING_LOCKUP_NOTE,
  },
  {
    id: 'stat-callout',
    name: 'Stat callouts',
    description: 'A large number in Oswald Bold with a short label in capitals.',
    use: 'One figure that matters.',
    note: 'Set the number in Teal on light backgrounds and Cyan on dark ones, and the label in Black or White. A single Yellow accent rule is optional. Never Raspberry for numbers.',
  },
  {
    id: 'timeline',
    name: 'Program timelines',
    description: 'Dots on a line, with each step above or below its dot.',
    use: 'Program and application dates.',
    note: 'Color the dots in the chart order: Teal, Yellow, Navy, MC Blue, Deep Teal, Gray 300. The words beside each dot carry the meaning, so the colors never have to.',
  },
  {
    id: 'icons',
    name: 'Icons',
    description:
      'Single color line icons with rounded ends, in Teal on light backgrounds and Cyan on dark ones.',
    use: 'Labels for areas, steps and features, always beside a word.',
  },
];

export const findDevice = (id: GraphicDeviceId): GraphicDevice => {
  const device = GRAPHIC_DEVICES.find((candidate) => candidate.id === id);
  if (!device) throw new Error(`Unknown graphic device: ${id}`);
  return device;
};
