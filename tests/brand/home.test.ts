import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRAND_KIT_URL } from '../../scripts/lib/brand-kit.mjs';
import { PLATFORMS } from '../../scripts/lib/platforms.mjs';
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

const SYNCED_PAGES = PLATFORMS.flatMap((platform) => Object.values(platform.pages)).map((page) =>
  `/${page.replace(/(index)?\.md$/, '')}`.replace(/([^/])$/, '$1/'),
);

const sourcesUnder = (folder: string): string[] =>
  readdirSync(folder, { recursive: true, encoding: 'utf8' })
    .filter((name) => /\.(astro|tsx)$/.test(name))
    .map((name) => join(folder, name));

const ANCHOR_SOURCES: Record<string, string[]> = {
  '': ['src/pages/index.astro'],
  '/': ['src/pages/index.astro'],
  '/brand/': ['src/pages/brand/index.astro', ...sourcesUnder('src/components/brand')],
};

const anchorExists = (path: string, anchor: string) =>
  (ANCHOR_SOURCES[path] ?? []).some((source) =>
    readFileSync(source, 'utf8').includes(`id="${anchor}"`),
  );

const ownPage = (href: string) => {
  const [path, anchor] = href.split('#');
  const pageExists = path === '' || pageFor(path) !== '' || SYNCED_PAGES.includes(path);
  return pageExists && (anchor === undefined || anchorExists(path, anchor));
};

describe('the home page content', () => {
  it('leads with the brand guidelines, starting with the logo', () => {
    expect(BRAND_NEEDS[0].id).toBe('logo');
    expect(BRAND_NEEDS.map((need) => need.id)).toEqual([
      'logo',
      'colors',
      'fonts',
      'photos',
      'voice',
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
    expect(ownPage('/web/no-such-page/')).toBe(false);
    expect(ownPage('/brand/#no-such-section')).toBe(false);
    expect(ownPage('#no-such-section')).toBe(false);
  });

  it('knows every page the platforms sync into the site', () => {
    expect(SYNCED_PAGES).toContain('/web/usage/');
    expect(SYNCED_PAGES).toContain('/web/websites/');
    expect(SYNCED_PAGES).toContain('/office/templates/');
    expect(SYNCED_PAGES).toContain('/brand/reference/');
  });

  it('builds the brand kit link from the kit name and hides it when the kit is missing', () => {
    const page = readFileSync('src/pages/index.astro', 'utf8');
    expect(BRAND_NEEDS.find((need) => need.isDownload)?.href).toBe(BRAND_KIT_URL);
    expect(page).not.toContain('masschallenge-brand-kit.zip');
    expect(page).toMatch(/hasBrandKit &&/);
    expect(page).toMatch(/BRAND_NEEDS\.filter\(\(need\) => hasBrandKit \|\| !need\.isDownload\)/);
  });

  it('talks to people in the hero and tells why it is called Propellant', () => {
    const page = readFileSync('src/pages/index.astro', 'utf8');
    expect(page).toContain('Make it look and sound like MassChallenge');
    expect(page).not.toMatch(/in one place/i);
    expect(page).toContain('Propellant is the fuel that makes everything at MassChallenge');
    expect(page).not.toMatch(/\bas of\b/i);
  });

  it('keeps the tool previews out of reach so each card only opens its tool', () => {
    const page = readFileSync('src/pages/index.astro', 'utf8');
    const previews = page.match(/<div[^>]*aria-hidden="true"[^>]*>/g) ?? [];
    const toolPreview = previews.find((tag) => tag.includes('h-72'));
    expect(toolPreview).toBeDefined();
    expect(toolPreview).toMatch(/\binert\b/);
  });

  it('stays a design system and leaves MassChallenge itself to masschallenge.org', () => {
    const page = readFileSync('src/pages/index.astro', 'utf8');
    const footer = readFileSync('src/components/site/SiteFooter.astro', 'utf8');
    expect(page).not.toMatch(/alt="MassChallenge"/);
    expect(page).not.toMatch(/about-title|id="contact"|OFFICES|SOCIAL_LINKS|APPROVED_FIGURES/);
    expect(footer).not.toMatch(/masschallenge-logo|OFFICES|SOCIAL_LINKS|CONTACT_EMAIL/);
    expect(footer).toContain('WEBSITE_URL');
    expect(FINDER.map((entry) => entry.href)).not.toContain('#contact');
  });

  it('names actions plainly and never asks people to start with one platform', () => {
    const text = JSON.stringify([BRAND_NEEDS, BRAND_TOOLS, BRAND_RESOURCES, FINDER]);
    expect(text).not.toMatch(/start with/i);
    expect(text).not.toMatch(/[–—]/);
    expect(new Set(FINDER.map((entry) => entry.need)).size).toBe(FINDER.length);
  });
});
