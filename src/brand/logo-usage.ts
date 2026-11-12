import { findColor } from './palette';

export type LogoLockupId = 'horizontal' | 'monogram';
export type LogoTreatmentId = 'color' | 'white' | 'black';
export type LogoVersionId = 'vertical' | 'horizontal' | 'monogram' | 'local';

export interface LogoVersion {
  id: LogoVersionId;
  name: string;
  use: string;
  screenMinimum: string | null;
  printMinimum: string | null;
  isShipped: boolean;
}

export interface LogoLockup {
  id: LogoLockupId;
  name: string;
  badge: string;
  use: string;
  minimumHeight: number;
  minimumWidth: number | null;
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
  treatment: 'color' | 'white';
}

export const LOGO_ASPECT: Record<LogoLockupId, number> = {
  horizontal: 1671 / 225,
  monogram: 321 / 177,
};

export const WORDMARK_M_SHARE = 91 / 225;

export const MARKETING_FILES_NOTE =
  'Propellant ships the horizontal logo and the MC mark. Vertical and local logo files come from MassChallenge Marketing; never draw or assemble them yourself.';

export const LOGO_VERSIONS: LogoVersion[] = [
  {
    id: 'vertical',
    name: 'Vertical',
    use: 'The default for most layouts.',
    screenMinimum: '60px wide',
    printMinimum: '20mm wide',
    isShipped: false,
  },
  {
    id: 'horizontal',
    name: 'Horizontal',
    use: 'When width is plentiful and height is tight: headers, footers, sponsor slides and banners.',
    screenMinimum: '160px wide',
    printMinimum: '30mm wide',
    isShipped: true,
  },
  {
    id: 'monogram',
    name: 'MC mark',
    use: 'Where the audience already knows us. In Propellant: compact navigation, favicons, avatars and app icons.',
    screenMinimum: '16px tall',
    printMinimum: '8mm',
    isShipped: true,
  },
  {
    id: 'local',
    name: 'Local logos',
    use: 'Work tied to one site: US sites use the city and international sites use the country. Approved local files exist for Boston, Israel, UK and Switzerland; for any other site, ask MassChallenge Marketing. Never type a location next to the logo.',
    screenMinimum: null,
    printMinimum: null,
    isShipped: false,
  },
];

export const LOGO_LOCKUPS: LogoLockup[] = [
  {
    id: 'horizontal',
    name: 'Horizontal',
    badge: 'Wide spaces',
    use: 'Headers, footers, sponsor slides and banners, where width is plentiful and height is tight. Align it to a corner or the top edge of its area.',
    minimumHeight: Math.ceil(160 / LOGO_ASPECT.horizontal),
    minimumWidth: 160,
    minimumNote:
      'At least 160px wide on screen and 30mm in print. Below that the wordmark stops being readable; use the MC mark instead.',
  },
  {
    id: 'monogram',
    name: 'MC mark',
    badge: 'Small spaces',
    use: 'Where the audience already knows us: favicons, app icons, avatars and compact navigation.',
    minimumHeight: 16,
    minimumWidth: null,
    minimumNote:
      'At least 8mm in print. Use it on its own only where the MassChallenge name is already clear.',
  },
];

export const LOGO_TREATMENTS: LogoTreatment[] = [
  {
    id: 'color',
    name: 'Full color',
    useOn: 'White or Warm White only.',
  },
  {
    id: 'white',
    name: 'White',
    useOn:
      'Navy, Black, Deep Teal, Teal, MC Blue, or a photo with enough contrast. Never on light colors such as Cyan, Yellow or Lime.',
  },
  {
    id: 'black',
    name: 'Black',
    useOn: 'One color print, and light backgrounds that the full color logo does not suit.',
  },
];

export const FULL_COLOR_LOGO_BACKGROUND_IDS = ['white', 'warm-white'];

export const WHITE_LOGO_BACKGROUND_IDS = ['navy', 'black', 'deep-teal', 'teal', 'mc-blue'];

export const NO_WHITE_LOGO_BACKGROUND_IDS = ['cyan', 'yellow', 'lime'];

export const LOGO_NEVER = [
  'Recolor it.',
  'Stretch or squash it.',
  'Rotate it.',
  'Outline it or add shadows, glows or other effects.',
  'Flip it.',
  'Crop it.',
  'Rearrange, rebuild or retype it.',
  'Create new lockups or sub-logos outside the sub-brand system.',
];

const backgroundFromPalette = (id: string, treatment: LogoBackground['treatment']) => {
  const color = findColor(id);
  return { id: color.id, name: color.name, hex: color.hex, isPhoto: false, treatment };
};

export const LOGO_BACKGROUNDS: LogoBackground[] = [
  ...FULL_COLOR_LOGO_BACKGROUND_IDS.map((id) => backgroundFromPalette(id, 'color')),
  ...WHITE_LOGO_BACKGROUND_IDS.map((id) => backgroundFromPalette(id, 'white')),
  { id: 'photo', name: 'On a photo', hex: null, isPhoto: true, treatment: 'white' },
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

export const treatmentFor = (background: LogoBackground): LogoTreatmentId => background.treatment;

export const suitsBackground = (
  treatment: LogoTreatmentId,
  background: LogoBackground,
): boolean => {
  if (treatment === 'white') return background.treatment === 'white';
  return background.treatment === 'color';
};

export const clearSpaceFor = (lockupId: LogoLockupId, logoHeight: number): number =>
  lockupId === 'horizontal' ? logoHeight * WORDMARK_M_SHARE : logoHeight / 2;

export const logoWidthFor = (lockupId: LogoLockupId, logoHeight: number): number =>
  logoHeight * LOGO_ASPECT[lockupId];

export const isBelowMinimum = (lockupId: LogoLockupId, logoHeight: number): boolean => {
  const lockup = findLockup(lockupId);
  if (lockup.minimumWidth !== null) {
    return logoWidthFor(lockupId, logoHeight) < lockup.minimumWidth;
  }
  return logoHeight < lockup.minimumHeight;
};

export const minimumLabel = (lockup: LogoLockup): string =>
  lockup.minimumWidth !== null ? `${lockup.minimumWidth}px wide` : `${lockup.minimumHeight}px tall`;

export const logoFileName = (lockupId: LogoLockupId, treatment: LogoTreatmentId): string =>
  `masschallenge-logo-${lockupId}-${treatment}.png`;
