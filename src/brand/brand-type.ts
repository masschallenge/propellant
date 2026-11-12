export type BrandFont = 'Oswald' | 'Lato';

export interface BrandTextStyle {
  id: string;
  name: string;
  font: BrandFont;
  weight: number;
  weightName: string;
  isCapitals: boolean;
  lineHeight: number | null;
  tracking: string | null;
  use: string;
  sample: string;
}

export interface TwoToneHeadline {
  lead: string;
  payoff: string;
  surfaceId: string;
  leadColorId: string;
  payoffColorId: string;
}

export const BRAND_TEXT_STYLES: BrandTextStyle[] = [
  {
    id: 'headline',
    name: 'Headline',
    font: 'Oswald',
    weight: 600,
    weightName: 'SemiBold',
    isCapitals: true,
    lineHeight: 1,
    tracking: null,
    use: 'Headlines, always in capitals.',
    sample: 'Demo day is here',
  },
  {
    id: 'eyebrow',
    name: 'Eyebrow and tag',
    font: 'Oswald',
    weight: 400,
    weightName: 'Regular',
    isCapitals: true,
    lineHeight: null,
    tracking: '0.3em',
    use: 'Above headlines, and on tags, labels and footers. Tracked +300.',
    sample: 'Events',
  },
  {
    id: 'subhead',
    name: 'Subhead',
    font: 'Oswald',
    weight: 600,
    weightName: 'SemiBold',
    isCapitals: true,
    lineHeight: null,
    tracking: null,
    use: 'Card titles, numbered blocks and section labels, smaller than the headline.',
    sample: 'What to expect',
  },
  {
    id: 'body',
    name: 'Body',
    font: 'Lato',
    weight: 400,
    weightName: 'Regular',
    isCapitals: false,
    lineHeight: 1.5,
    tracking: null,
    use: 'Reading text. Lato Bold for emphasis. Never body copy in Oswald or in capitals.',
    sample:
      'Meet the founders of the spring cohort, see their work up close and stay for the conversations after.',
  },
  {
    id: 'big-stat',
    name: 'Big stat',
    font: 'Oswald',
    weight: 700,
    weightName: 'Bold',
    isCapitals: true,
    lineHeight: 1,
    tracking: null,
    use: 'Optional. Numbers at display size only. The only use of Oswald Bold.',
    sample: '2026',
  },
];

export const TWO_TONE_HEADLINES: TwoToneHeadline[] = [
  {
    lead: 'Demo day',
    payoff: 'is here',
    surfaceId: 'white',
    leadColorId: 'black',
    payoffColorId: 'teal',
  },
  {
    lead: 'Demo day',
    payoff: 'is here',
    surfaceId: 'navy',
    leadColorId: 'white',
    payoffColorId: 'cyan',
  },
];

export const OFFICE_FONT_FALLBACK = {
  headers: 'Aptos Narrow Bold, in capitals',
  body: 'Aptos',
  never: 'Arial',
  note: 'Use them only where Oswald or Lato will not load, such as Office and email. Both ship with Microsoft 365. Install Oswald and Lato on every staff computer, and embed the fonts in PowerPoint templates (File > Options > Save > Embed fonts).',
};

export const RETIRED_FONTS = ['Gotham', 'Bebas', 'Arial', 'Montserrat', 'Open Sans'];

export const findBrandTextStyle = (id: string): BrandTextStyle => {
  const style = BRAND_TEXT_STYLES.find((candidate) => candidate.id === id);
  if (!style) throw new Error(`Unknown brand text style: ${id}`);
  return style;
};

export const brandTextCss = (style: BrandTextStyle): string =>
  [
    `font-family: ${style.font === 'Oswald' ? "'Oswald', 'Aptos Narrow', sans-serif" : "'Lato', 'Aptos', sans-serif"};`,
    `font-weight: ${style.weight};`,
    ...(style.isCapitals ? ['text-transform: uppercase;'] : []),
    ...(style.lineHeight !== null ? [`line-height: ${style.lineHeight};`] : []),
    ...(style.tracking ? [`letter-spacing: ${style.tracking};`] : []),
  ].join(' ');
