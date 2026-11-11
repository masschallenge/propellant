import horizontalBlack from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-horizontal-black.png?url';
import horizontalColor from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-horizontal-color.png?url';
import horizontalWhite from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-horizontal-white.png?url';
import monogramBlack from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-monogram-black.png?url';
import monogramColor from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-monogram-color.png?url';
import monogramWhite from '@masschallenge/propellant-web/assets/logos/masschallenge-logo-monogram-white.png?url';
import type { LogoKey } from '../../studio/render';

export const LOGO_URLS: Record<LogoKey, string> = {
  'horizontal-color': horizontalColor,
  'horizontal-white': horizontalWhite,
  'horizontal-black': horizontalBlack,
  'monogram-color': monogramColor,
  'monogram-white': monogramWhite,
  'monogram-black': monogramBlack,
};
