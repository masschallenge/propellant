import { hexToRgb } from './contrast';
import { findColor } from './palette';

export interface Duotone {
  shadowId: string;
  highlightId: string;
}

export const BRAND_DUOTONE: Duotone = { shadowId: 'deep-teal', highlightId: 'bright-teal' };

export const duotoneChannels = (
  red: number,
  green: number,
  blue: number,
  duotone: Duotone = BRAND_DUOTONE,
): [number, number, number] => {
  const shadow = hexToRgb(findColor(duotone.shadowId).hex);
  const highlight = hexToRgb(findColor(duotone.highlightId).hex);
  const lightness = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  const mix = (shadowChannel: number, highlightChannel: number) =>
    Math.round(shadowChannel + (highlightChannel - shadowChannel) * lightness);
  return [
    mix(shadow.red, highlight.red),
    mix(shadow.green, highlight.green),
    mix(shadow.blue, highlight.blue),
  ];
};
