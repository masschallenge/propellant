import { describe, expect, it } from 'vitest';
import {
  BRAND_TEXT_STYLES,
  OFFICE_FONT_FALLBACK,
  RETIRED_FONTS,
  TWO_TONE_HEADLINES,
  brandTextCss,
  findBrandTextStyle,
} from '../../src/brand/brand-type';
import { findColor } from '../../src/brand/palette';

describe('brand type', () => {
  it('sets the headline in Oswald SemiBold capitals at line height 1.0', () => {
    const headline = findBrandTextStyle('headline');
    expect([headline.font, headline.weight, headline.isCapitals, headline.lineHeight]).toEqual([
      'Oswald',
      600,
      true,
      1,
    ]);
  });

  it('tracks the eyebrow +300 in Oswald Regular capitals', () => {
    const eyebrow = findBrandTextStyle('eyebrow');
    expect([eyebrow.font, eyebrow.weight, eyebrow.isCapitals, eyebrow.tracking]).toEqual([
      'Oswald',
      400,
      true,
      '0.3em',
    ]);
  });

  it('sets subheads in Oswald SemiBold capitals and body in Lato at 1.5', () => {
    expect(findBrandTextStyle('subhead')).toMatchObject({
      font: 'Oswald',
      weight: 600,
      isCapitals: true,
    });
    expect(findBrandTextStyle('body')).toMatchObject({
      font: 'Lato',
      weight: 400,
      isCapitals: false,
      lineHeight: 1.5,
    });
  });

  it('keeps Oswald Bold for the big stat only', () => {
    const bold = BRAND_TEXT_STYLES.filter(
      (style) => style.font === 'Oswald' && style.weight === 700,
    );
    expect(bold.map((style) => style.id)).toEqual(['big-stat']);
  });

  it('pairs Black or White with Teal on light and Cyan on dark in a two-tone headline', () => {
    expect(
      TWO_TONE_HEADLINES.map((headline) => [
        findColor(headline.surfaceId).name,
        findColor(headline.leadColorId).name,
        findColor(headline.payoffColorId).name,
      ]),
    ).toEqual([
      ['White', 'Black', 'Teal'],
      ['Navy', 'White', 'Cyan'],
    ]);
  });

  it('falls back to Aptos, never Arial, and retires the old fonts', () => {
    expect(OFFICE_FONT_FALLBACK.headers).toMatch(/Aptos Narrow Bold/);
    expect(OFFICE_FONT_FALLBACK.body).toBe('Aptos');
    expect(OFFICE_FONT_FALLBACK.never).toBe('Arial');
    expect(RETIRED_FONTS).toEqual(['Gotham', 'Bebas', 'Arial', 'Montserrat', 'Open Sans']);
  });

  it('writes CSS with the Aptos fallbacks and no Arial', () => {
    const headlineCss = brandTextCss(findBrandTextStyle('headline'));
    expect(headlineCss).toContain("'Oswald', 'Aptos Narrow', sans-serif");
    expect(headlineCss).toContain('font-weight: 600;');
    expect(headlineCss).toContain('text-transform: uppercase;');
    expect(headlineCss).toContain('line-height: 1;');
    expect(brandTextCss(findBrandTextStyle('body'))).toContain(
      "font-family: 'Propellant Sans', 'Lato', 'Aptos', sans-serif;",
    );
    BRAND_TEXT_STYLES.forEach((style) => expect(brandTextCss(style)).not.toMatch(/arial/i));
  });

  it('refuses unknown styles', () => {
    expect(() => findBrandTextStyle('display')).toThrow();
  });
});
