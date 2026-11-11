import type { PostFormat } from './formats';

export type TextRoleId = 'headline' | 'body' | 'bold';

export type SizeStepId =
  | 'display'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'lead'
  | 'body'
  | 'small';

export interface SizeStep {
  id: SizeStepId;
  name: string;
  token: string;
  pixels: number;
  linePixels: number;
}

export const SIZE_STEPS: SizeStep[] = [
  { id: 'display', name: 'Display', token: '--type-display-size', pixels: 40, linePixels: 44 },
  {
    id: 'heading-1',
    name: 'Heading 1',
    token: '--type-large-title-size',
    pixels: 30,
    linePixels: 36,
  },
  { id: 'heading-2', name: 'Heading 2', token: '--type-title1-size', pixels: 24, linePixels: 30 },
  { id: 'heading-3', name: 'Heading 3', token: '--type-title2-size', pixels: 20, linePixels: 26 },
  { id: 'lead', name: 'Lead', token: '--type-title3-size', pixels: 17, linePixels: 22 },
  { id: 'body', name: 'Body', token: '--type-body-size', pixels: 15, linePixels: 22 },
  { id: 'small', name: 'Small', token: '--type-footnote-size', pixels: 12, linePixels: 16 },
];

export type CapitalsRule = 'always' | 'never';

export interface TextRole {
  id: TextRoleId;
  fontName: string;
  roleName: string;
  label: string;
  family: string;
  weight: number;
  capitals: CapitalsRule;
  rule: string;
  sizes: SizeStepId[];
  defaultSize: SizeStepId;
}

const OSWALD_FAMILY = "'Oswald', 'Arial Narrow', sans-serif";
const SANS_FAMILY = "'Propellant Sans', 'Lato', sans-serif";

export const TEXT_ROLES: TextRole[] = [
  {
    id: 'headline',
    fontName: 'Oswald',
    roleName: 'Headline',
    label: 'Oswald, Headline',
    family: OSWALD_FAMILY,
    weight: 700,
    capitals: 'always',
    rule: 'Display headlines on public websites and pages, set in capitals. It is made for short, large headlines and is hard to read in long text, so never use it for paragraphs. Display sizes only.',
    sizes: ['display', 'heading-1', 'heading-2'],
    defaultSize: 'display',
  },
  {
    id: 'body',
    fontName: 'Propellant Sans',
    roleName: 'Body text',
    label: 'Propellant Sans, Body text',
    family: SANS_FAMILY,
    weight: 400,
    capitals: 'never',
    rule: 'All interface and body text. Use sentence case: capitals belong only to Oswald headlines and the wordmark. Letter spacing is fixed.',
    sizes: ['lead', 'body', 'small'],
    defaultSize: 'body',
  },
  {
    id: 'bold',
    fontName: 'Propellant Sans Bold',
    roleName: 'Subheads and calls to action',
    label: 'Propellant Sans Bold, Subheads and calls to action',
    family: SANS_FAMILY,
    weight: 700,
    capitals: 'never',
    rule: 'Headings are Lato Bold in sentence case: a capital first letter and lower case after it, except for names. Letter spacing is fixed.',
    sizes: ['heading-2', 'heading-3', 'lead', 'body', 'small'],
    defaultSize: 'lead',
  },
];

export const DESIGN_WIDTH = 360;

export const findTextRole = (id: TextRoleId): TextRole => {
  const role = TEXT_ROLES.find((candidate) => candidate.id === id);
  if (!role) throw new Error(`Unknown text role: ${id}`);
  return role;
};

export const findSizeStep = (id: SizeStepId): SizeStep => {
  const step = SIZE_STEPS.find((candidate) => candidate.id === id);
  if (!step) throw new Error(`Unknown size: ${id}`);
  return step;
};

export const canvasScale = (format: PostFormat): number =>
  Math.min(format.width, format.height) / DESIGN_WIDTH;

export const fontPixels = (sizeId: SizeStepId, format: PostFormat): number =>
  Math.round(findSizeStep(sizeId).pixels * canvasScale(format));

export const linePixels = (sizeId: SizeStepId, format: PostFormat): number =>
  Math.round(findSizeStep(sizeId).linePixels * canvasScale(format));

export const fontString = (roleId: TextRoleId, sizeId: SizeStepId, format: PostFormat): string => {
  const role = findTextRole(roleId);
  return `${role.weight} ${fontPixels(sizeId, format)}px ${role.family}`;
};

export const isSizeAllowed = (roleId: TextRoleId, sizeId: SizeStepId): boolean =>
  findTextRole(roleId).sizes.includes(sizeId);

export const nearestAllowedSize = (roleId: TextRoleId, sizeId: SizeStepId): SizeStepId => {
  const role = findTextRole(roleId);
  if (role.sizes.includes(sizeId)) return sizeId;
  const wanted = findSizeStep(sizeId).pixels;
  return role.sizes.reduce((best, candidate) =>
    Math.abs(findSizeStep(candidate).pixels - wanted) < Math.abs(findSizeStep(best).pixels - wanted)
      ? candidate
      : best,
  );
};

export const LARGE_TEXT_PIXELS = 24;
export const LARGE_BOLD_TEXT_PIXELS = 18.66;

export const isLargeText = (roleId: TextRoleId, sizeId: SizeStepId): boolean => {
  const pixels = findSizeStep(sizeId).pixels;
  const role = findTextRole(roleId);
  return pixels >= LARGE_TEXT_PIXELS || (role.weight >= 700 && pixels >= LARGE_BOLD_TEXT_PIXELS);
};

export const requiredContrast = (roleId: TextRoleId, sizeId: SizeStepId): number =>
  isLargeText(roleId, sizeId) ? 3 : 4.5;
