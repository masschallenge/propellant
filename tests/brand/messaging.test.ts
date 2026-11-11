import { describe, expect, it } from 'vitest';
import {
  ACCELERATORS,
  APPROVED_FIGURES,
  AUDIENCES,
  BOILERPLATES,
  CHALLENGE_AREAS,
  POSITIONING,
  PRIMARY_LINE,
  findBoilerplate,
  wordCount,
} from '../../src/brand/messaging';

const everything = [
  PRIMARY_LINE,
  ...POSITIONING,
  ...BOILERPLATES.map((boilerplate) => boilerplate.text),
].join('\n');

describe('the messaging standard', () => {
  it('states the primary line', () => {
    expect(PRIMARY_LINE).toBe(
      'We back the rare humans with the grit to solve the toughest challenges.',
    );
  });

  it('builds each boilerplate on the one before it', () => {
    const [short, medium, long] = BOILERPLATES;
    expect(medium.text.startsWith(short.text)).toBe(true);
    expect(long.text.startsWith(medium.text)).toBe(true);
    expect(wordCount(short.text)).toBeLessThan(wordCount(medium.text));
    expect(wordCount(medium.text)).toBeLessThan(wordCount(long.text));
    expect(findBoilerplate('long')).toBe(long);
    expect(() => findBoilerplate('huge' as never)).toThrow();
  });

  it('keeps the long boilerplate in step with the approved figures', () => {
    const long = findBoilerplate('long').text;
    ['2009', '5,000', '$16B+', '90K', '500'].forEach((figure) => expect(long).toContain(figure));
    expect(APPROVED_FIGURES.map((figure) => figure.value)).toContain('90K');
    expect(everything).not.toMatch(/77K/);
  });

  it('presents every figure as current, with no as of date', () => {
    const figures = APPROVED_FIGURES.map((figure) => `${figure.label} ${figure.value}`).join('\n');
    expect(`${everything}\n${figures}`).not.toMatch(/\bas of\b/i);
  });

  it('lists the areas, accelerators and audiences', () => {
    expect(CHALLENGE_AREAS).toHaveLength(5);
    expect(CHALLENGE_AREAS.join(' ')).not.toContain('&');
    expect(ACCELERATORS).toEqual(['Traction', 'Challenge', 'Breakthrough Bio']);
    expect(AUDIENCES).toEqual(['Founders', 'Experts', 'Collaborators']);
  });

  it('never uses em or en dashes', () => {
    expect(everything).not.toMatch(/[–—]/);
  });
});
