import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BRAND_NEEDS, BRAND_RESOURCES, BRAND_TOOLS, FINDER } from '../../src/brand/home';

const pageFor = (href: string): string => {
  const path = href.split('#')[0];
  if (path === '/') return 'src/pages/index.astro';
  const trimmed = path.replace(/^\/|\/$/g, '');
  const candidates = [
    `src/pages/${trimmed}/index.astro`,
    `src/content/docs/${trimmed}.md`,
    `src/content/docs/${trimmed}/index.md`,
    `src/content/docs/${trimmed}.mdx`,
  ];
  return candidates.find((candidate) => existsSync(candidate)) ?? '';
};

const SYNCED_DOCS = readFileSync('.gitignore', 'utf8')
  .split('\n')
  .filter((line) => line.startsWith('src/content/docs/'))
  .map((line) => `/${line.replace('src/content/docs/', '').replace(/\.md$/, '/')}`);

const isSyncedFromAPlatform = (href: string) =>
  SYNCED_DOCS.some((prefix) => href.split('#')[0].startsWith(prefix));

const ownPage = (href: string) =>
  href.startsWith('#') || pageFor(href) !== '' || isSyncedFromAPlatform(href);

describe('the home page content', () => {
  it('leads with the brand guidelines, starting with the logo', () => {
    expect(BRAND_NEEDS[0].id).toBe('logo');
    expect(BRAND_NEEDS.map((need) => need.id)).toEqual([
      'logo',
      'colors',
      'fonts',
      'about',
      'photos',
      'voice',
      'contact',
      'kit',
    ]);
  });

  it('offers the studio and the email signature as tools, then Web and Office', () => {
    expect(BRAND_TOOLS.map((tool) => tool.href)).toEqual(['/studio/', '/studio/signature/']);
    expect(BRAND_RESOURCES.map((resource) => resource.href)).toEqual(['/web/', '/office/']);
  });

  it('links only to pages and sections that exist on the site', () => {
    const brandAndToolLinks = [
      ...BRAND_NEEDS.filter((need) => !need.isDownload),
      ...BRAND_TOOLS,
      ...BRAND_RESOURCES,
      ...FINDER,
    ].map((entry) => entry.href);
    brandAndToolLinks.forEach((href) => expect(ownPage(href), href).toBe(true));
    expect(ownPage('/no-such-page/')).toBe(false);
  });

  it('names actions plainly and never asks people to start with one platform', () => {
    const text = JSON.stringify([BRAND_NEEDS, BRAND_TOOLS, BRAND_RESOURCES, FINDER]);
    expect(text).not.toMatch(/start with/i);
    expect(text).not.toMatch(/[–—]/);
    expect(new Set(FINDER.map((entry) => entry.need)).size).toBe(FINDER.length);
  });
});
