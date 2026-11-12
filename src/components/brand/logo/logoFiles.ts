import horizontalColor from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-horizontal-color.png?url&no-inline';
import horizontalWhite from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-horizontal-white.png?url&no-inline';
import horizontalBlack from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-horizontal-black.png?url&no-inline';
import monogramColor from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-monogram-color.png?url&no-inline';
import monogramWhite from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-monogram-white.png?url&no-inline';
import monogramBlack from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-monogram-black.png?url&no-inline';
import type { LogoLockupId, LogoTreatmentId } from '../../../brand/logo-usage';

export const LOGO_FILES: Record<LogoLockupId, Record<LogoTreatmentId, string>> = {
  horizontal: { color: horizontalColor, white: horizontalWhite, black: horizontalBlack },
  monogram: { color: monogramColor, white: monogramWhite, black: monogramBlack },
};
