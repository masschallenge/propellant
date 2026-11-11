import {
  MINIMUM_LARGE_CONTRAST,
  MINIMUM_TEXT_CONTRAST,
  contrastRatio,
  pairingLevel,
} from './contrast';
import type { PairingLevel } from './contrast';
import { BRAND_COLORS, findColor } from './palette';
import type { BrandColor } from './palette';

export type WcagGrade = 'AA' | 'AA Large' | 'Fail';

export interface ContrastScore {
  against: string;
  ratio: number;
  label: string;
  grade: WcagGrade;
}

export interface Pairing {
  color: BrandColor;
  ratio: number;
  label: string;
}

export type PairingGroups = Record<PairingLevel, Pairing[]>;

export const formatRatio = (ratio: number): string => {
  const truncated = Math.floor(ratio * 10) / 10;
  const digits = truncated.toFixed(1).replace(/\.0$/, '');
  return `${digits}:1`;
};

export const wcagGrade = (ratio: number): WcagGrade => {
  if (ratio >= MINIMUM_TEXT_CONTRAST) return 'AA';
  if (ratio >= MINIMUM_LARGE_CONTRAST) return 'AA Large';
  return 'Fail';
};

export const contrastScores = (hex: string): ContrastScore[] =>
  [findColor('white'), findColor('ink')].map((against) => {
    const ratio = contrastRatio(hex, against.hex);
    return { against: against.name, ratio, label: formatRatio(ratio), grade: wcagGrade(ratio) };
  });

export const pairingsOn = (
  background: BrandColor,
  palette: BrandColor[] = BRAND_COLORS,
): PairingGroups => {
  const groups: PairingGroups = { any: [], large: [], never: [] };
  palette
    .filter((candidate) => candidate.id !== background.id)
    .map((candidate) => {
      const ratio = contrastRatio(candidate.hex, background.hex);
      return { color: candidate, ratio, label: formatRatio(ratio) };
    })
    .sort((first, second) => second.ratio - first.ratio)
    .forEach((pairing) => {
      groups[pairingLevel(pairing.color.hex, background.hex)].push(pairing);
    });
  return groups;
};
