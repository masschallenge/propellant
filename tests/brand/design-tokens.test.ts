import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  MOTION_DEMOS,
  TEXT_STYLES,
  parseTokenSheet,
  stylesOverriddenBy,
  textStyleTokens,
  weightUsage,
} from '../../src/brand/design-tokens';

const tokenFile = (name: string) =>
  readFileSync(
    join(process.cwd(), 'node_modules/@masschallenge/propellant-web/tokens', name),
    'utf8',
  );

describe('design tokens', () => {
  it('parses root declarations and media overrides', () => {
    const sheet = parseTokenSheet(`
      :root {
        --space: 4px;
        --curve: linear(
          0,
          1
        );
      }
      @media (max-width: 639px) {
        :root {
          --space: 2px;
        }
      }
    `);
    expect(sheet.base).toEqual({ '--space': '4px', '--curve': 'linear(0, 1)' });
    expect(sheet.overrides).toEqual({ '(max-width: 639px)': { '--space': '2px' } });
  });

  it('reads all eleven text styles from the real typography tokens', () => {
    const sheet = parseTokenSheet(tokenFile('typography.css'));
    expect(TEXT_STYLES).toHaveLength(11);
    TEXT_STYLES.forEach((style) => {
      const tokens = textStyleTokens(sheet.base, style.id);
      expect(tokens.size.value).not.toBe('');
      expect(tokens.line.value).not.toBe('');
      expect(tokens.weight.value).not.toBe('');
    });
    expect(textStyleTokens(sheet.base, 'body').size).toEqual({
      name: '--type-body-size',
      value: '0.9375rem',
    });
    expect(sheet.base['--type-measure']).toBe('68ch');
  });

  it('knows which styles shrink on small screens', () => {
    const sheet = parseTokenSheet(tokenFile('typography.css'));
    const overrides = sheet.overrides['(max-width: 639px)'];
    expect(stylesOverriddenBy(overrides).map((style) => style.id)).toEqual([
      'display',
      'large-title',
      'title1',
    ]);
  });

  it('maps every weight to the styles that use it', () => {
    const sheet = parseTokenSheet(tokenFile('typography.css'));
    const usage = weightUsage(sheet.base);
    const boldStyles = usage.find((entry) => entry.weight === '700')?.styles ?? [];
    expect(boldStyles.map((style) => style.id)).toContain('display');
    const listed = usage.flatMap((entry) => entry.styles);
    expect(listed).toHaveLength(TEXT_STYLES.length);
  });

  it('demos only motion tokens that exist', () => {
    const sheet = parseTokenSheet(tokenFile('motion.css'));
    MOTION_DEMOS.forEach((demo) => {
      expect(sheet.base[demo.token]).toBeTruthy();
      if (demo.durationToken) expect(sheet.base[demo.durationToken]).toMatch(/ms$/);
    });
    expect(sheet.base['--ease-standard']).toBe('cubic-bezier(0.2, 0, 0, 1)');
    expect(sheet.overrides['(prefers-reduced-motion: reduce)']['--spring-snappy-duration']).toBe(
      '1ms',
    );
  });
});
