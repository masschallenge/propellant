import typographyCss from '../../../../node_modules/@masschallenge/propellant-web/tokens/typography.css?raw';
import motionCss from '../../../../node_modules/@masschallenge/propellant-web/tokens/motion.css?raw';
import { parseTokenSheet } from '../../../brand/design-tokens';

export const TYPOGRAPHY_TOKENS = parseTokenSheet(typographyCss);
export const MOTION_TOKENS = parseTokenSheet(motionCss);
