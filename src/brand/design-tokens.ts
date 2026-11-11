export type TokenMap = Record<string, string>;

export interface TokenSheet {
  base: TokenMap;
  overrides: Record<string, TokenMap>;
}

export interface TextStyle {
  id: string;
  name: string;
}

export interface TokenEntry {
  name: string;
  value: string;
}

export interface TextStyleTokens {
  size: TokenEntry;
  line: TokenEntry;
  weight: TokenEntry;
  tracking: TokenEntry;
}

export type MotionKind = 'easing' | 'spring' | 'duration';

export interface MotionDemo {
  id: string;
  name: string;
  kind: MotionKind;
  token: string;
  durationToken: string | null;
  usedBy: string[];
}

export interface WeightUsage {
  weight: string;
  name: string;
  styles: TextStyle[];
}

export const TEXT_STYLES: TextStyle[] = [
  { id: 'display', name: 'Display' },
  { id: 'large-title', name: 'Large title' },
  { id: 'title1', name: 'Title 1' },
  { id: 'title2', name: 'Title 2' },
  { id: 'title3', name: 'Title 3' },
  { id: 'headline', name: 'Headline' },
  { id: 'body', name: 'Body' },
  { id: 'callout', name: 'Callout' },
  { id: 'subheadline', name: 'Subheadline' },
  { id: 'footnote', name: 'Footnote' },
  { id: 'caption', name: 'Caption' },
];

export const FONT_WEIGHTS = [
  { weight: '400', name: 'Regular' },
  { weight: '500', name: 'Medium' },
  { weight: '600', name: 'Semibold' },
  { weight: '700', name: 'Bold' },
];

export const MOTION_DEMOS: MotionDemo[] = [
  {
    id: 'standard',
    name: 'Standard easing',
    kind: 'easing',
    token: '--ease-standard',
    durationToken: null,
    usedBy: ['Button', 'Checkbox', 'Switch', 'Card'],
  },
  {
    id: 'exit',
    name: 'Exit easing',
    kind: 'easing',
    token: '--ease-exit',
    durationToken: null,
    usedBy: [],
  },
  {
    id: 'snappy',
    name: 'Snappy spring',
    kind: 'spring',
    token: '--spring-snappy',
    durationToken: '--spring-snappy-duration',
    usedBy: ['SegmentedControl', 'Switch', 'Radio', 'DisclosureGroup'],
  },
  {
    id: 'smooth',
    name: 'Smooth spring',
    kind: 'spring',
    token: '--spring-smooth',
    durationToken: '--spring-smooth-duration',
    usedBy: ['Progress', 'FileUploader'],
  },
  {
    id: 'bouncy',
    name: 'Bouncy spring',
    kind: 'spring',
    token: '--spring-bouncy',
    durationToken: '--spring-bouncy-duration',
    usedBy: [],
  },
  {
    id: 'instant',
    name: 'Instant',
    kind: 'duration',
    token: '--duration-instant',
    durationToken: '--duration-instant',
    usedBy: ['Button', 'IconButton', 'Checkbox', 'Card'],
  },
  {
    id: 'fade',
    name: 'Fade',
    kind: 'duration',
    token: '--duration-fade',
    durationToken: '--duration-fade',
    usedBy: ['Switch', 'Checkbox', 'RadioCardGroup', 'FileUploader'],
  },
  {
    id: 'exit-duration',
    name: 'Exit',
    kind: 'duration',
    token: '--duration-exit',
    durationToken: '--duration-exit',
    usedBy: [],
  },
];

const tidyValue = (value: string): string =>
  value.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();

const declarationsIn = (block: string): TokenMap =>
  block
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration.startsWith('--'))
    .reduce<TokenMap>((tokens, declaration) => {
      const separator = declaration.indexOf(':');
      const name = declaration.slice(0, separator).trim();
      tokens[name] = tidyValue(declaration.slice(separator + 1));
      return tokens;
    }, {});

export const parseTokenSheet = (css: string): TokenSheet => {
  const sheet: TokenSheet = { base: {}, overrides: {} };
  const blockPattern = /(?:@media\s*([^{]+?)\s*\{\s*)?:root\s*\{([^}]*)\}/g;
  for (const match of css.matchAll(blockPattern)) {
    const [, mediaQuery, body] = match;
    const declarations = declarationsIn(body);
    if (mediaQuery) {
      sheet.overrides[mediaQuery] = { ...sheet.overrides[mediaQuery], ...declarations };
    } else {
      Object.assign(sheet.base, declarations);
    }
  }
  return sheet;
};

const entry = (tokens: TokenMap, name: string): TokenEntry => ({
  name,
  value: tokens[name] ?? '',
});

export const textStyleTokens = (tokens: TokenMap, styleId: string): TextStyleTokens => ({
  size: entry(tokens, `--type-${styleId}-size`),
  line: entry(tokens, `--type-${styleId}-line`),
  weight: entry(tokens, `--type-${styleId}-weight`),
  tracking: entry(tokens, `--type-${styleId}-tracking`),
});

export const weightUsage = (tokens: TokenMap): WeightUsage[] =>
  FONT_WEIGHTS.map((fontWeight) => ({
    ...fontWeight,
    styles: TEXT_STYLES.filter(
      (style) => tokens[`--type-${style.id}-weight`] === fontWeight.weight,
    ),
  }));

export const stylesOverriddenBy = (overrides: TokenMap): TextStyle[] =>
  TEXT_STYLES.filter((style) => `--type-${style.id}-size` in overrides);
