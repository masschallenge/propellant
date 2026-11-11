import type { MeasureText } from '../../src/studio/text';

export const fakeMeasure: MeasureText = (text, font) => {
  const match = font.match(/(\d+(?:\.\d+)?)px/);
  const size = match ? Number(match[1]) : 10;
  return text.length * size * 0.55;
};
