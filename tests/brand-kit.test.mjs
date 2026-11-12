import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  BRAND_KIT_FOLDERS,
  BRAND_KIT_NAME,
  BRAND_KIT_URL,
  brandKitFile,
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

  it('serves the archive from one URL and file', () => {
    expect(BRAND_KIT_URL).toBe('/downloads/masschallenge-brand-kit.zip');
    expect(brandKitFile('/site')).toBe('/site/public/downloads/masschallenge-brand-kit.zip');
  });
});

describe('the color files', () => {
  it('lists every brand, supporting and logo color with its hex, rgb and cmyk', () => {
    const text = colorsText(colors);
    [...colors.brandColors, ...colors.supportingColors, ...colors.logoColors].forEach((color) => {
      expect(text).toContain(color.name);
      expect(text).toContain(color.hex);
      if (color.cmyk) expect(text).toContain(`CMYK   ${color.cmyk.join(', ')} (approximate)`);
    });
    expect(text).toContain('RGB    16, 38, 63');
    expect(text).toContain('CMYK   75, 40, 0, 75 (approximate)');
    expect(text).toContain('Print  #00CFE8');
    expect(text).toContain('Token  var(--yellow-400)');
    expect(text).toContain('SUPPORTING NEUTRALS AND TINT');
  });

  it('writes valid JSON with the same colors', () => {
    const parsed = JSON.parse(colorsJson(colors));
    expect(parsed.brandColors).toHaveLength(colors.brandColors.length);
    expect(parsed.logoColors).toHaveLength(colors.logoColors.length);
    expect(parsed.supportingColors).toHaveLength(colors.supportingColors.length);
    expect(parsed.brandColors[0]).toEqual({
      name: 'MC Blue',
      hex: '#0EABBC',
      rgb: '14, 171, 188',
      cmyk: '93, 9, 0, 26',
      printSubstitute: null,
      token: null,
      role: colors.brandColors[0].role,
    });
    expect(parsed.brandColors.find((color) => color.name === 'Ocean').cmyk).toBeNull();
    expect(parsed.logoColors[1].cmyk).toBe('93, 9, 0, 26');
  });

  it('says the print values are approximate and gives CMYK only', () => {
    [colorsText(colors), colorsJson(colors)].forEach((file) => {
      expect(file).toContain('confirm with a printer proof');
      expect(file).not.toMatch(/pantone|PMS\s*\d|artifex/i);
    });
  });
});

describe('the readme', () => {
  it('explains every folder and file in the kit', () => {
    const readme = readmeText();
    Object.values(BRAND_KIT_FOLDERS).forEach((folder) => expect(readme).toContain(`${folder}/`));
    expect(readme).toContain('colors.txt');
    expect(readme).toContain('colors.json');
  });

  it('gives the logo and font rules from the brand guide', () => {
    const readme = readmeText().replace(/\s+/g, ' ');
    expect(readme).toContain('height of the M in MASSCHALLENGE');
    expect(readme).toContain('160px wide on screen');
    expect(readme).toContain('Vertical and local logo files come from MassChallenge Marketing');
    expect(readme).toContain('Aptos Narrow Bold');
    expect(readme).toContain('Never Arial');
  });

  it('follows the writing rules', () => {
    const everything = [readmeText(), colorsText(colors)].join('\n');
    expect(everything).not.toMatch(/[\u2013\u2014]/);
    expect(everything).not.toMatch(/Mass Challenge|Masschallenge/);
  });
});
