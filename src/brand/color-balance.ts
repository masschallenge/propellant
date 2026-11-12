import { BRAND_COLORS, colorsInFamily, findColor, isWarmAccent } from './palette';
import type { BrandColor } from './palette';

export type BalanceRuleId = 'carry' | 'small-doses' | 'one-accent';

export interface BalanceRule {
  id: BalanceRuleId;
  title: string;
  text: string;
  colors: BrandColor[];
}

export const CARRYING_COLOR_IDS = [
  'navy',
  'black',
  'deep-teal',
  'teal',
  'mc-blue',
  'cyan',
  'white',
  'warm-white',
];

export const COLOR_BALANCE: BalanceRule[] = [
  {
    id: 'carry',
    title: 'Navy, Black and the blues carry the layout',
    text: 'Navy, Black and the blues carry most of every layout, with White and Warm White for the light sections.',
    colors: CARRYING_COLOR_IDS.map(findColor),
  },
  {
    id: 'small-doses',
    title: 'Warm accents in small doses',
    text: 'Yellow, Orange, Raspberry and Lime are for a word, a tag, a rule or a stat. Never a large background.',
    colors: colorsInFamily('accent'),
  },
  {
    id: 'one-accent',
    title: 'One warm accent per piece',
    text: 'Choose one warm accent for a piece and leave the others out.',
    colors: [],
  },
];

export const warmAccentsIn = (colorIds: string[]): BrandColor[] =>
  BRAND_COLORS.filter((color) => isWarmAccent(color.id) && colorIds.includes(color.id));

export const hasOneWarmAccentAtMost = (colorIds: string[]): boolean =>
  warmAccentsIn(colorIds).length <= 1;
