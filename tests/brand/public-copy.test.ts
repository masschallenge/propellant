import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const PUBLIC_SOURCES = ['src/brand', 'src/components', 'src/pages', 'skill', 'scripts/lib'];

const PENDING_WORDING = [
  /not (yet )?(known|confirmed|decided)/i,
  /until the brand team/i,
  /brand team confirms/i,
  /open question/i,
  /first pass/i,
  /being sought/i,
  /no (svg|vector)/i,
  /confirm (the )?releases/i,
  /may (include|be) licensed stock/i,
  /pantone matches/i,
  /noun project/i,
  /\bTBD\b/,
  /read on 2026/i,
];

const filesUnder = (folder: string): string[] =>
  readdirSync(folder).flatMap((name) => {
    const path = join(folder, name);
    return statSync(path).isDirectory() ? filesUnder(path) : [path];
  });

const publicFiles = PUBLIC_SOURCES.flatMap(filesUnder).filter((path) =>
  /\.(ts|tsx|astro|md|mjs|json)$/.test(path),
);

describe('the public pages', () => {
  it('carry no pending, unconfirmed or provisional wording', () => {
    const offenders = publicFiles.flatMap((path) => {
      const text = readFileSync(path, 'utf8');
      return PENDING_WORDING.filter((pattern) => pattern.test(text)).map(
        (pattern) => `${path}: ${pattern}`,
      );
    });
    expect(offenders).toEqual([]);
  });
});
