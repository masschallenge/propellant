import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SKILL_NAME, artifactStylesheet } from '../scripts/lib/skill-package.mjs';

const skill = readFileSync(`skill/${SKILL_NAME}/SKILL.md`, 'utf8');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)[1];
const field = (name) => frontmatter.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1];

describe('the skill definition', () => {
  it('has only a name and a description, within the published limits', () => {
    const keys = frontmatter.split('\n').map((line) => line.split(':')[0]);
    expect(keys).toEqual(['name', 'description']);
    expect(field('name')).toBe(SKILL_NAME);
    expect(field('name')).toMatch(/^[a-z0-9-]{1,64}$/);
    expect(field('name')).not.toMatch(/claude|anthropic/);
    expect(field('description').length).toBeLessThanOrEqual(1024);
  });

  it('stays under 500 lines and links only to files it ships', () => {
    expect(skill.split('\n').length).toBeLessThan(500);
    const links = [...skill.matchAll(/\]\(((?:references|assets|scripts)\/[^)]+)\)/g)].map(
      (match) => match[1],
    );
    const packaged = ['assets/templates/', 'assets/logos', 'assets/propellant-website.css'];
    links
      .filter((link) => !packaged.some((prefix) => link.startsWith(prefix)))
      .forEach((link) => expect(() => readFileSync(`skill/${SKILL_NAME}/${link}`)).not.toThrow());
  });

  it('never uses em or en dashes', () => {
    expect(skill).not.toMatch(/[–—]/);
  });
});

describe('artifactStylesheet', () => {
  const websiteCss = [
    "@font-face {\n  font-family: 'Propellant Sans';\n  src: url('../assets/fonts/a.woff2');\n}",
    ':root {\n  --tint: #065e6f;\n}',
  ].join('\n');
  const stylesheet = artifactStylesheet(websiteCss);

  it('loads the fonts from Google Fonts instead of the package files', () => {
    expect(stylesheet).not.toContain('@font-face');
    expect(stylesheet).toContain('fonts.googleapis.com/css2?family=Lato');
    expect(stylesheet).toContain("--type-family: 'Lato'");
    expect(stylesheet).toContain('--tint: #065e6f;');
  });

  it('marks its own start and end so the brand checker can skip it', () => {
    expect(stylesheet.startsWith('/* propellant-website.css start */')).toBe(true);
    expect(stylesheet.trim().endsWith('/* propellant-website.css end */')).toBe(true);
  });
});
