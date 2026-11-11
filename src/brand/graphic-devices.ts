import { contrastRatio } from './contrast';
import { findColor } from './palette';

export interface GraphicExample {
  src: string;
  alt: string;
  width: number;
  height: number;
  isOnDark?: boolean;
}

export type GraphicDeviceId =
  | 'teal-duotone'
  | 'hexagon-frame'
  | 'pattern'
  | 'co-brand'
  | 'program-lockup'
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

const ratioText = (foreground: string, background: string): string =>
  `${(Math.floor(contrastRatio(findColor(foreground).hex, findColor(background).hex) * 10) / 10).toFixed(1)}:1`;

export const patternLabelNote = (): string =>
  `Set the label in Ink (${ratioText('ink', 'bright-teal')} on Bright teal, ${ratioText('ink', 'pale-teal')} on Pale teal), or in White on a solid Deep teal panel (${ratioText('white', 'deep-teal')}). Never set it in White straight on the triangles: White on Bright teal is only ${ratioText('white', 'bright-teal')}, below the 3:1 that even large text needs.`;

export const GRAPHIC_DEVICES: GraphicDevice[] = [
  {
    id: 'pattern',
    name: 'Geometric pattern',
    description:
      'Bright teal and Pale teal triangles, with an Oswald label in capitals on top, such as ACCELERATOR or CHALLENGE. This is the brand pattern.',
    use: 'Covers and headers for a program or a page.',
    note: patternLabelNote(),
  },
  {
    id: 'teal-duotone',
    name: 'Teal duotone',
    description: 'A photo washed in a gradient from Deep teal to Bright teal.',
    use: 'Backgrounds behind text, and section headers.',
  },
  {
    id: 'hexagon-frame',
    name: 'Hexagon network frame',
    description: 'A circular photo crop inside a pale teal network of hexagons and lines.',
    use: 'A single photo beside text, such as on a partner page.',
  },
  {
    id: 'co-brand',
    name: 'Co-brand lockup',
    description:
      'The MassChallenge logo, a plus sign and the partner logo, on white with a thin teal border, or a teal panel with the white MassChallenge logo beside the partner.',
    use: 'Work made with a partner. Use the logo files, never a redrawn logo.',
  },
  {
    id: 'program-lockup',
    name: 'Program lockup',
    description:
      'The MC monogram, a thin vertical divider and the program name in capitals, such as MC | RESOLVE 2026, or SMU Cox | MC.',
    use: 'A named program or event.',
  },
  {
    id: 'stat-callout',
    name: 'Stat callouts',
    description: 'A large number with a short label in capitals.',
    use: 'One figure that matters, with its as of date.',
    note: 'Set the number in Deep teal on light backgrounds and Bright teal on dark ones, and the label in Ink or White. Never Magenta: it only ever means something is wrong.',
  },
  {
    id: 'timeline',
    name: 'Program timelines',
    description: 'Dots on a line, with each step above or below its dot.',
    use: 'Program and application dates.',
    note: 'Color the dots in the chart order: Teal, Yellow, Slate, Bright teal, Deep teal, Gray 300. The words beside each dot carry the meaning, so the colors never have to.',
  },
  {
    id: 'icons',
    name: 'Icons',
    description:
      'Single color line icons with rounded ends, in Teal on light backgrounds and Bright teal on dark ones.',
    use: 'Labels for areas, steps and features, always beside a word.',
  },
];

export const findDevice = (id: GraphicDeviceId): GraphicDevice => {
  const device = GRAPHIC_DEVICES.find((candidate) => candidate.id === id);
  if (!device) throw new Error(`Unknown graphic device: ${id}`);
  return device;
};
