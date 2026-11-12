import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SKILL_NAME,
  UNRELEASED_VERSIONS,
  artifactStylesheet,
  readVersions,
  stampVersions,
  writeVersions,
} from '../scripts/lib/skill-package.mjs';

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

describe('the skill as the default for MassChallenge work', () => {
  const webReference = readFileSync(`skill/${SKILL_NAME}/references/web-and-apps.md`, 'utf8');

  it('triggers on the things people make, even without the brand named', () => {
    const description = field('description');
    [
      'web application',
      'React',
      'slide deck',
      'PowerPoint',
      'Word',
      'spreadsheet',
      'Excel',
      'even when they do not mention the brand',
    ].forEach((phrase) => expect(description).toContain(phrase));
  });

  it('names the source of truth and where facts about MassChallenge live', () => {
    expect(skill).toContain('https://propellant.masschallenge.org/llms-full.txt');
    expect(skill).toContain('https://masschallenge.org/');
    expect(skill).toContain('{{propellant-web}}');
    expect(skill).toContain('{{propellant-office}}');
  });

  it('leaves the package version to the build instead of hardcoding it', () => {
    expect(webReference).toContain('propellant-web#{{propellant-web}}');
    expect(webReference).not.toMatch(/propellant-web#v\d/);
  });

  it('tells engineers how to work in an existing codebase', () => {
    expect(webReference).toContain('## Working in an existing codebase');
    expect(webReference).toMatch(/Never hardcode hex colors/);
  });
});

describe('stampVersions', () => {
  const versions = { 'propellant-web': 'v1.1.1', 'propellant-office': 'v1.0.0' };

  it('fills in every release placeholder', () => {
    expect(
      stampVersions(
        'web {{propellant-web}}, office {{propellant-office}}, {{propellant-web}}',
        versions,
      ),
    ).toBe('web v1.1.1, office v1.0.0, v1.1.1');
  });

  it('leaves text without placeholders alone', () => {
    expect(stampVersions('No versions here.', versions)).toBe('No versions here.');
  });

  it('fails the build when a release is missing', () => {
    expect(() => stampVersions('{{propellant-office}}', { 'propellant-web': 'v1.1.1' })).toThrow(
      /propellant-office/,
    );
  });
});

describe('the recorded release versions', () => {
  it('reads back the versions the build recorded', () => {
    const root = mkdtempSync(join(tmpdir(), 'propellant-versions-'));
    writeVersions(root, { 'propellant-web': 'v2.0.0', 'propellant-office': 'v1.4.0' });
    expect(readVersions(root)).toEqual({
      'propellant-web': 'v2.0.0',
      'propellant-office': 'v1.4.0',
    });
    rmSync(root, { recursive: true, force: true });
  });

  it('falls back to main when nothing was released yet', () => {
    const root = mkdtempSync(join(tmpdir(), 'propellant-versions-'));
    expect(readVersions(root)).toEqual(UNRELEASED_VERSIONS);
    expect(stampVersions('#{{propellant-web}}', readVersions(root))).toBe('#main');
    rmSync(root, { recursive: true, force: true });
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

  it('loads every Oswald weight the brand type uses', () => {
    expect(stylesheet).toContain('family=Oswald:wght@400;500;600;700&');
  });

  it('marks its own start and end so the brand checker can skip it', () => {
    expect(stylesheet.startsWith('/* propellant-website.css start */')).toBe(true);
    expect(stylesheet.trim().endsWith('/* propellant-website.css end */')).toBe(true);
  });
});

describe('the skill references', () => {
  const folder = `skill/${SKILL_NAME}/references`;
  const references = Object.fromEntries(
    readdirSync(folder).map((name) => [name, readFileSync(`${folder}/${name}`, 'utf8')]),
  );
  const colors = JSON.parse(readFileSync('src/brand/colors.json', 'utf8'));

  it('never uses em or en dashes', () => {
    Object.values(references).forEach((text) => expect(text).not.toMatch(/[\u2013\u2014]/));
  });

  it('never presents the founder testimonial as a MassChallenge line', () => {
    [skill, ...Object.values(references)].forEach((text) => {
      text
        .split('\n\n')
        .filter((paragraph) => paragraph.includes('takes a community to raise a startup'))
        .forEach((paragraph) => expect(paragraph).toMatch(/testimonial/));
    });
  });

  it('carries the primary line, the boilerplate and the contact details', () => {
    const messaging = references['messaging.md'];
    expect(messaging.replace(/\s+/g, ' ')).toContain(
      'We back the rare humans with the grit to solve the toughest challenges.',
    );
    expect(messaging).toContain('contact@masschallenge.org');
    expect(messaging).toContain('https://x.com/MassChallenge');
    expect(messaging).toContain('90K');
  });

  it('lists the same print CMYK values and substitutes as the guide', () => {
    const graphics = references['graphics.md'];
    [...colors.brandColors, ...colors.supportingColors, ...colors.logoColors]
      .filter((color) => color.cmyk)
      .forEach((color) => {
        expect(graphics).toMatch(
          new RegExp(`\`${color.hex}\`\\s*\\|\\s*${color.cmyk.join(' ')}\\s`),
        );
      });
    colors.brandColors
      .filter((color) => color.printSubstitute)
      .forEach((color) => expect(graphics).toContain(`\`${color.printSubstitute}\``));
    expect(graphics).toContain('approximate, so confirm with a printer proof');
    expect(graphics).not.toMatch(/pantone|artifex/i);
  });

  it('retires the teal duotone and the old brand colors everywhere in the skill', () => {
    const editable = Object.entries(references)
      .filter(([name]) => !['voice.md', 'messaging.md'].includes(name))
      .map(([, reference]) => reference);
    [skill, ...editable].forEach((text) => {
      ['#044451', '#065E6F', '#0FACBD', '#D9F6FA', '#F3FBFC', '#1E282B', '#BF0261'].forEach(
        (retired) => expect(text).not.toContain(retired),
      );
      expect(text).not.toMatch(/Bright teal|Pale teal|Mist|\bInk\b|Magenta/);
    });
    expect(skill).toMatch(/The teal duotone is retired/);
    expect(references['photography.md']).toMatch(/hero overlay/);
  });

  it('falls back to Aptos and never Arial', () => {
    expect(skill).toMatch(/Aptos Narrow Bold/);
    expect(skill).toMatch(/Never Arial/);
  });

  it('tells Claude never to suggest Pantone', () => {
    expect(skill).toContain('Never suggest or quote Pantone colors.');
  });

  it('never quotes the interface gray or status magenta as brand colors', () => {
    [skill, ...Object.values(references)].forEach((text) => {
      expect(text).not.toContain('#F3F6F7');
      expect(text).not.toContain('#A30253');
    });
  });
});
