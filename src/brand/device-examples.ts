import { contrastRatio } from './contrast';
import { APPROVED_FIGURES } from './messaging';
import { chartColors, findColor } from './palette';

export interface PatternCover {
  label: string;
  labelColorId: string;
  panelColorId: string | null;
  alt: string;
}

export const PATTERN_COVERS: PatternCover[] = [
  {
    label: 'ACCELERATOR',
    labelColorId: 'black',
    panelColorId: null,
    alt: 'ACCELERATOR in Black capitals over a pattern of MC Blue and light tint triangles',
  },
  {
    label: 'CHALLENGE',
    labelColorId: 'white',
    panelColorId: 'navy',
    alt: 'CHALLENGE in White capitals on a Navy panel over a pattern of MC Blue and light tint triangles',
  },
];

export interface SubBrandLockup {
  name: string;
  location: string;
  surfaceColorId: string;
  monogramTreatment: 'color' | 'white';
  ruleColorId: string;
  textColorId: string;
}

export const SUB_BRAND_LOCKUPS: SubBrandLockup[] = [
  {
    name: 'PROGRAM NAME',
    location: 'LOCATION',
    surfaceColorId: 'white',
    monogramTreatment: 'color',
    ruleColorId: 'mc-blue',
    textColorId: 'black',
  },
  {
    name: 'PROGRAM NAME',
    location: 'LOCATION',
    surfaceColorId: 'navy',
    monogramTreatment: 'white',
    ruleColorId: 'cyan',
    textColorId: 'white',
  },
];

export interface PartnerLockup {
  surfaceColorId: string;
  ruleColorId: string;
  textColorId: string;
}

export const PARTNER_LOCKUPS: PartnerLockup[] = [
  { surfaceColorId: 'white', ruleColorId: 'mc-gray', textColorId: 'black' },
  { surfaceColorId: 'navy', ruleColorId: 'white', textColorId: 'white' },
];

export const ENDORSEMENT_EXAMPLE = {
  initiative: 'INITIATIVE NAME',
  endorsement: 'WITH MASSCHALLENGE',
  surfaceColorId: 'white',
  textColorId: 'black',
};

export interface StatCallout {
  value: string;
  label: string;
  surfaceColorId: string;
  numberColorId: string;
  labelColorId: string;
  accentRuleColorId: string | null;
}

const figureValue = (id: string): string => {
  const figure = APPROVED_FIGURES.find((candidate) => candidate.id === id);
  if (!figure) throw new Error(`Unknown figure: ${id}`);
  return figure.value;
};

export const STAT_CALLOUTS: StatCallout[] = [
  {
    value: figureValue('jobs'),
    label: 'JOBS CREATED',
    surfaceColorId: 'white',
    numberColorId: 'teal',
    labelColorId: 'black',
    accentRuleColorId: 'yellow',
  },
  {
    value: figureValue('raised'),
    label: 'RAISED BY STARTUPS',
    surfaceColorId: 'navy',
    numberColorId: 'cyan',
    labelColorId: 'white',
    accentRuleColorId: null,
  },
];

export interface TimelineStep {
  name: string;
  hex: string;
  isAbove: boolean;
}

export const TIMELINE_STEP_NAMES = [
  'Applications open',
  'Applications close',
  'Judging',
  'Cohort announced',
  'Program kickoff',
  'Finale',
];

export const TIMELINE_LINE_HEX = findColor('gray-300').hex;

export const timelineSteps = (): TimelineStep[] => {
  const colors = chartColors();
  return TIMELINE_STEP_NAMES.map((name, index) => ({
    name,
    hex: colors[index % colors.length].hex,
    isAbove: index % 2 === 0,
  }));
};

export interface IconSurface {
  surfaceColorId: string;
  iconColorId: string;
  labelColorId: string;
}

export const ICON_SURFACES: IconSurface[] = [
  { surfaceColorId: 'white', iconColorId: 'teal', labelColorId: 'black' },
  { surfaceColorId: 'navy', iconColorId: 'cyan', labelColorId: 'white' },
];

export const HEXAGON_FRAME = {
  hexagonColorId: 'mc-blue',
  lineColorId: 'light-tint',
  surfaceColorId: 'navy',
};

export const hexagonPoints = (centerX: number, centerY: number, radius: number): string =>
  Array.from({ length: 6 }, (emptySlot, corner) => {
    const angle = (Math.PI / 3) * corner + Math.PI / 6;
    return `${(centerX + radius * Math.cos(angle)).toFixed(1)},${(centerY + radius * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');

export const exampleContrast = (foregroundId: string, backgroundId: string): number =>
  contrastRatio(findColor(foregroundId).hex, findColor(backgroundId).hex);
