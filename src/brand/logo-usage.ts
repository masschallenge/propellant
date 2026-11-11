import { isDark } from './contrast';
import { findColor } from './palette';

export type LogoLockupId = 'horizontal' | 'monogram';
export type LogoTreatmentId = 'color' | 'white' | 'black';

export interface LogoLockup {
  id: LogoLockupId;
  name: string;
  badge: string;
  use: string;
  minimumHeight: number;
  minimumNote: string;
}

export interface LogoTreatment {
  id: LogoTreatmentId;
  name: string;
  useOn: string;
}

export interface LogoBackground {
  id: string;
  name: string;
  hex: string | null;
  isPhoto: boolean;
}

export const LOGO_LOCKUPS: LogoLockup[] = [
  {
    id: 'horizontal',
    name: 'Horizontal',
    badge: 'Primary',
    use: 'The default. Headers, sign in pages, footers, documents and anywhere the full name should be read.',
    minimumHeight: 24,
    minimumNote: 'Below this the wordmark stops being readable; use the monogram instead.',
  },
  {
    id: 'monogram',
    name: 'Monogram',
    badge: 'Small spaces',
    use: 'Small spaces where the horizontal lockup would fall below its minimum size: favicons, app icons, avatars and compact navigation.',
    minimumHeight: 16,
    minimumNote: 'Use it on its own only where the MassChallenge name is already clear.',
  },
];

export const LOGO_TREATMENTS: LogoTreatment[] = [
  {
    id: 'color',
    name: 'Full color',
    useOn: 'White and light neutral backgrounds, such as the page and content surfaces.',
  },
  {
    id: 'white',
    name: 'White',
    useOn:
      'The brand teal, dark surfaces, dark mode and photographs dark enough to keep the logo legible.',
  },
  {
    id: 'black',
    name: 'Black',
    useOn:
      'Places where only one dark color is available, such as single color print, and light backgrounds that the full color logo does not suit.',
  },
];

const backgroundFromPalette = (id: string): LogoBackground => {
  const color = findColor(id);
  return { id: color.id, name: color.name, hex: color.hex, isPhoto: false };
};

export const LOGO_BACKGROUNDS: LogoBackground[] = [
  backgroundFromPalette('white'),
  backgroundFromPalette('mist'),
  backgroundFromPalette('pale-teal'),
  backgroundFromPalette('deep-teal'),
  backgroundFromPalette('teal'),
  backgroundFromPalette('ink'),
  { id: 'photo', name: 'On a photo', hex: null, isPhoto: true },
];

export const findLockup = (id: LogoLockupId): LogoLockup => {
  const lockup = LOGO_LOCKUPS.find((candidate) => candidate.id === id);
  if (!lockup) throw new Error(`Unknown logo lockup: ${id}`);
  return lockup;
};

export const findTreatment = (id: LogoTreatmentId): LogoTreatment => {
  const treatment = LOGO_TREATMENTS.find((candidate) => candidate.id === id);
  if (!treatment) throw new Error(`Unknown logo treatment: ${id}`);
  return treatment;
};

export const findBackground = (id: string): LogoBackground => {
  const background = LOGO_BACKGROUNDS.find((candidate) => candidate.id === id);
  if (!background) throw new Error(`Unknown logo background: ${id}`);
  return background;
};

const isDarkBackground = (background: LogoBackground): boolean =>
  background.isPhoto || (background.hex !== null && isDark(background.hex));

export const treatmentFor = (background: LogoBackground): LogoTreatmentId =>
  isDarkBackground(background) ? 'white' : 'color';

export const suitsBackground = (
  treatment: LogoTreatmentId,
  background: LogoBackground,
): boolean => {
  if (treatment === 'white') return isDarkBackground(background);
  return !isDarkBackground(background);
};

export const clearSpaceFor = (logoHeight: number): number => logoHeight / 2;

export const isBelowMinimum = (lockupId: LogoLockupId, logoHeight: number): boolean =>
  logoHeight < findLockup(lockupId).minimumHeight;

export const logoFileName = (lockupId: LogoLockupId, treatment: LogoTreatmentId): string =>
  `masschallenge-logo-${lockupId}-${treatment}.png`;
