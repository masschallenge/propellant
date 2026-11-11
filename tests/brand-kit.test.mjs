import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BRAND_KIT_FOLDERS,
  BRAND_KIT_NAME,
  colorsJson,
  colorsText,
  isFontFile,
  isLogoFile,
  isPropellantMarkFile,
  readmeText,
} from '../scripts/lib/brand-kit.mjs';

const colors = JSON.parse(readFileSync('src/brand/colors.json', 'utf8'));

describe('the brand kit contents', () => {
  it('picks every MassChallenge logo PNG and nothing else for the logos folder', () => {
    expect(isLogoFile('masschallenge-logo-horizontal-color.png')).toBe(true);
    expect(isLogoFile('masschallenge-logo-monogram-white.png')).toBe(true);
    expect(isLogoFile('propellant-mark-color.svg')).toBe(false);
    expect(isLogoFile('masschallenge-logo-horizontal-color.svg')).toBe(false);
  });

  it('keeps the Propellant mark apart from the MassChallenge logo', () => {
    expect(BRAND_KIT_FOLDERS.designSystem).toBe('design-system-only');
    expect(isPropellantMarkFile('propellant-mark-white.svg')).toBe(true);
    expect(isPropellantMarkFile('propellant-lockup-color.svg')).toBe(true);
    expect(isPropellantMarkFile('masschallenge-logo-horizontal-color.png')).toBe(false);
  });

  it('ships the fonts with their licenses', () => {
    expect(isFontFile('propellant-sans-400-latin.woff2')).toBe(true);
    expect(isFontFile('OFL-Lato.txt')).toBe(true);
    expect(isFontFile('OFL-Oswald.txt')).toBe(true);
    expect(isFontFile('README.md')).toBe(false);
  });

  it('names the archive after MassChallenge', () => {
    expect(BRAND_KIT_NAME).toBe('masschallenge-brand-kit');
  });
});

describe('the color files', () => {
  it('lists every brand and logo color with its hex and rgb', () => {
    const text = colorsText(colors);
    [...colors.brandColors, ...colors.logoColors].forEach((color) => {
      expect(text).toContain(color.name);
      expect(text).toContain(color.hex);
    });
    expect(text).toContain('RGB    4, 68, 81');
    expect(text).toContain('Token  var(--teal-900)');
  });

  it('writes valid JSON with the same colors', () => {
    const parsed = JSON.parse(colorsJson(colors));
    expect(parsed.brandColors).toHaveLength(colors.brandColors.length);
    expect(parsed.logoColors).toHaveLength(colors.logoColors.length);
    expect(parsed.brandColors[0]).toEqual({
      name: 'Deep teal',
      hex: '#044451',
      rgb: '4, 68, 81',
      token: '--teal-900',
      role: colors.brandColors[0].role,
    });
  });

  it('does not invent print values', () => {
    expect(colorsText(colors)).not.toMatch(/CMYK\s+\d/);
    expect(colorsJson(colors)).not.toMatch(/cmyk|pantone/i);
  });
});

describe('the readme', () => {
  it('explains every folder and file in the kit', () => {
    const readme = readmeText();
    Object.values(BRAND_KIT_FOLDERS).forEach((folder) => expect(readme).toContain(`${folder}/`));
    expect(readme).toContain('colors.txt');
    expect(readme).toContain('colors.json');
  });

  it('follows the writing rules', () => {
    const everything = [readmeText(), colorsText(colors)].join('\n');
    expect(everything).not.toMatch(/[\u2013\u2014]/);
    expect(everything).not.toMatch(/Mass Challenge|Masschallenge/);
  });
});
