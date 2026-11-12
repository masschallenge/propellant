import { MINIMUM_LARGE_CONTRAST, MINIMUM_TEXT_CONTRAST, contrastRatio } from './contrast';
import { findColor } from './palette';
import type { BrandColor } from './palette';

export type WcagGrade = 'AA' | 'AA Large' | 'Fail';

export interface ContrastScore {
  against: string;
  ratio: number;
  label: string;
  grade: WcagGrade;
}

export interface PairingSpec {
  foregroundId: string;
  backgroundId: string;
}

export interface Pairing {
  foreground: BrandColor;
  background: BrandColor;
  ratio: number;
  label: string;
  grade: WcagGrade;
}

export const APPROVED_PAIRINGS: PairingSpec[] = [
  { foregroundId: 'cyan', backgroundId: 'navy' },
  { foregroundId: 'white', backgroundId: 'black' },
  { foregroundId: 'teal', backgroundId: 'white' },
  { foregroundId: 'white', backgroundId: 'deep-teal' },
  { foregroundId: 'navy', backgroundId: 'warm-white' },
  { foregroundId: 'lime', backgroundId: 'navy' },
];

export const VERIFIED_PAIRINGS: PairingSpec[] = [
  { foregroundId: 'white', backgroundId: 'teal' },
  { foregroundId: 'black', backgroundId: 'yellow' },
  { foregroundId: 'black', backgroundId: 'orange' },
  { foregroundId: 'white', backgroundId: 'navy' },
  { foregroundId: 'cyan', backgroundId: 'deep-teal' },
];

export const FAILING_PAIRINGS: PairingSpec[] = [
  { foregroundId: 'white', backgroundId: 'mc-blue' },
  { foregroundId: 'mc-blue', backgroundId: 'white' },
  { foregroundId: 'teal', backgroundId: 'navy' },
  { foregroundId: 'white', backgroundId: 'orange' },
];

export const formatRatio = (ratio: number): string => {
  const truncated = Math.floor(ratio * 10) / 10;
  const digits = truncated.toFixed(1).replace(/\.0$/, '');
  return `${digits}:1`;
};

export const formatGuideRatio = (ratio: number): string => `${ratio.toFixed(1)}:1`;

export const wcagGrade = (ratio: number): WcagGrade => {
  if (ratio >= MINIMUM_TEXT_CONTRAST) return 'AA';
  if (ratio >= MINIMUM_LARGE_CONTRAST) return 'AA Large';
  return 'Fail';
};

export const contrastScores = (hex: string): ContrastScore[] =>
  [findColor('white'), findColor('black')].map((against) => {
    const ratio = contrastRatio(hex, against.hex);
    return { against: against.name, ratio, label: formatRatio(ratio), grade: wcagGrade(ratio) };
  });

export const resolvePairing = (spec: PairingSpec): Pairing => {
  const foreground = findColor(spec.foregroundId);
  const background = findColor(spec.backgroundId);
  const ratio = contrastRatio(foreground.hex, background.hex);
  return { foreground, background, ratio, label: formatGuideRatio(ratio), grade: wcagGrade(ratio) };
};

export const resolvePairings = (specs: PairingSpec[]): Pairing[] => specs.map(resolvePairing);
