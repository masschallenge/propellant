import { contrastRatio } from './contrast';
import { APPROVED_FIGURES } from './messaging';
import { SUPPORTING_COLORS, chartColors, findColor } from './palette';

export interface PatternCover {
  label: string;
  labelColorId: string;
  panelColorId: string | null;
  alt: string;
}

export const PATTERN_COVERS: PatternCover[] = [
  {
    label: 'ACCELERATOR',
    labelColorId: 'ink',
    panelColorId: null,
    alt: 'ACCELERATOR in Ink capitals over a pattern of Bright teal and Pale teal triangles',
  },
  {
    label: 'CHALLENGE',
    labelColorId: 'white',
    panelColorId: 'deep-teal',
    alt: 'CHALLENGE in White capitals on a Deep teal panel over a pattern of Bright teal and Pale teal triangles',
  },
];

export interface ProgramLockup {
  name: string;
  surfaceColorId: string;
  monogramTreatment: 'color' | 'white';
  dividerColorId: string;
  nameColorId: string;
}

export const PROGRAM_LOCKUPS: ProgramLockup[] = [
  {
    name: 'RESOLVE 2026',
    surfaceColorId: 'white',
    monogramTreatment: 'color',
    dividerColorId: 'teal',
    nameColorId: 'ink',
  },
  {
    name: 'RESOLVE 2026',
    surfaceColorId: 'deep-teal',
    monogramTreatment: 'white',
    dividerColorId: 'bright-teal',
    nameColorId: 'white',
  },
];

export interface StatCallout {
  value: string;
  label: string;
  surfaceColorId: string;
  numberColorId: string;
  labelColorId: string;
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
    numberColorId: 'deep-teal',
    labelColorId: 'ink',
  },
  {
    value: figureValue('raised'),
    label: 'RAISED BY STARTUPS',
    surfaceColorId: 'deep-teal',
    numberColorId: 'bright-teal',
    labelColorId: 'white',
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

export const TIMELINE_LINE_HEX = SUPPORTING_COLORS.find((color) => color.id === 'gray-300')?.hex;

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
}

export const ICON_SURFACES: IconSurface[] = [
  { surfaceColorId: 'white', iconColorId: 'teal' },
  { surfaceColorId: 'deep-teal', iconColorId: 'bright-teal' },
];

export const exampleContrast = (foregroundId: string, backgroundId: string): number =>
  contrastRatio(findColor(foregroundId).hex, findColor(backgroundId).hex);
