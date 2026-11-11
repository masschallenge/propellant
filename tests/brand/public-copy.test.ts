import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_SOURCES = [
  'src/brand',
  'src/components',
  'src/pages',
  'src/content',
  'skill',
  'scripts/lib',
];

const PENDING_WORDING = [
  /\b(unknown|unconfirmed|undecided|unresolved)\b/i,
  /\bnot (yet )?(known|confirmed|decided|settled|resolved)\b/i,
  /\b(still|is|are) being (decided|sought|confirmed|reviewed|finalized)\b/i,
  /\bto be (decided|confirmed|determined|announced)\b/i,
  /\b(tbd|tbc|tba)\b/i,
  /\bopen (question|conflict)\b/i,
  /\bfirst pass\b/i,
  /\buntil the brand team\b/i,
  /\bno (svg|vector)\b/i,
  /\bconfirm (the )?(releases|licen[cs]e)\b/i,
  /\b(may|might) (include|be) (licensed )?stock\b/i,
  /\bpantone\b/i,
  /\bnoun project\b/i,
  /\((from|shown on|based on|per) the (file ?name|image|photo)\)/i,
  /\bread on \d{4}-\d{2}-\d{2}\b/i,
];

const ALLOWED_LINES = [/throw new Error\(/, /Never suggest or quote Pantone colors\./];

const filesUnder = (folder: string): string[] =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });

const publicFiles = PUBLIC_SOURCES.flatMap(filesUnder).filter((path) =>
  /\.(ts|tsx|astro|md|mdx|mjs|json)$/.test(path),
);

const pendingIn = (text: string): RegExp[] => {
  const checked = text
    .split('\n')
    .filter((line) => !ALLOWED_LINES.some((allowed) => allowed.test(line)))
    .join('\n');
  return PENDING_WORDING.filter((pattern) => pattern.test(checked));
};

describe('the public pages', () => {
  it('carry no pending, unconfirmed or provisional wording', () => {
    const offenders = publicFiles.flatMap((path) =>
      pendingIn(readFileSync(path, 'utf8')).map((pattern) => `${path}: ${pattern}`),
    );
    expect(offenders).toEqual([]);
  });

  it('catches the kinds of wording, not only the sentences already removed', () => {
    [
      'The icon licence is unknown.',
      'This figure is unconfirmed.',
      'The SVG is still being decided.',
      'Owner: tbd',
      'Use Pantone 294.',
      'Anne-Laure Lechat (from the file name).',
      'Photos read on 2027-03-01.',
      'Pantone matches are not set.',
    ].forEach((sentence) => expect(pendingIn(sentence), sentence).not.toEqual([]));
  });

  it('lets the skill forbid Pantone and code name its own errors', () => {
    expect(pendingIn('Never suggest or quote Pantone colors.')).toEqual([]);
    expect(pendingIn('  if (!color) throw new Error(`Unknown brand color: ${id}`);')).toEqual([]);
  });
});
