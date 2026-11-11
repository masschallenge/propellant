import { contrastRatio } from './contrast';
import { findColor } from './palette';

export interface GraphicExample {
  src: string;
  alt: string;
  width: number;
  height: number;
  page: string;
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
  `White on Bright teal is only ${ratioText('white', 'bright-teal')}, below the 3:1 that even large text needs, so the white label on the website does not pass. Set the label in Ink (${ratioText('ink', 'bright-teal')} on Bright teal, ${ratioText('ink', 'pale-teal')} on Pale teal), or put it on a solid Deep teal panel.`;

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
    use: 'One figure that matters, with its as of date and source.',
    note: 'The website sets these numbers in crimson. In new work use Deep teal on light backgrounds and Bright teal on dark ones. Never Magenta: it only ever means something is wrong. The 77K jobs graphic conflicts with the About page, which says 90K; use 90K until the brand team confirms.',
  },
  {
    id: 'timeline',
    name: 'Program timelines',
    description: 'Dots on a line, with dates above and below.',
    use: 'Program and application dates.',
    note: 'Color the dots in the chart order rather than the orange, purple and green the website uses today.',
  },
  {
    id: 'icons',
    name: 'Icons',
    description:
      'Single color line icons (Noun Project), in Teal on light backgrounds and Bright teal on dark ones.',
    use: 'Labels for areas, steps and features, as in the FinTech stats graphic above.',
    note: 'The Noun Project licence MassChallenge holds is not known. It needs confirming before new icons are used.',
  },
];

export interface OffPaletteMapping {
  seen: string;
  swatches: string[];
  where: string;
  useInstead: string;
}

export const OFF_PALETTE_MAPPINGS: OffPaletteMapping[] = [
  {
    seen: '#00708E, #00BBC3, #5CE1E6 and #0EABBC',
    swatches: ['#00708E', '#00BBC3', '#5CE1E6', '#0EABBC'],
    where: 'Icon tints',
    useInstead: 'Teal or Bright teal',
  },
  {
    seen: 'Crimson',
    swatches: [],
    where: 'Stat numbers',
    useInstead: 'Deep teal on light, Bright teal on dark. Never Magenta, which means wrong.',
  },
  {
    seen: 'Orange, purple and green',
    swatches: [],
    where: 'Timeline dots',
    useInstead: 'The chart order: Teal, Yellow, Slate, Bright teal, Deep teal, Gray 300',
  },
];

export const findDevice = (id: GraphicDeviceId): GraphicDevice => {
  const device = GRAPHIC_DEVICES.find((candidate) => candidate.id === id);
  if (!device) throw new Error(`Unknown graphic device: ${id}`);
  return device;
};
