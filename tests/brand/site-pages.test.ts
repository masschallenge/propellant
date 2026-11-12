import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { SITE_PAGES } from '../../src/brand/site-pages';

const PAGE_FILES: Record<string, string> = {
  '/brand/': 'src/pages/brand/index.astro',
  '/studio/': 'src/pages/studio/index.astro',
  '/studio/signature/': 'src/pages/studio/signature/index.astro',
};

describe('the site pages outside the docs', () => {
  it('takes each page title and description from the shared list', () => {
    SITE_PAGES.forEach((page) => {
      const source = readFileSync(PAGE_FILES[page.path], 'utf8');
      expect(source, page.path).toMatch(/title=\{\w+_PAGE\.title\}/);
      expect(source, page.path).toMatch(/description=\{\w+_PAGE\.description\}/);
    });
  });

  it('describes every page in plain words', () => {
    SITE_PAGES.forEach((page) => {
      expect(page.description.length).toBeGreaterThan(20);
      expect(page.description).not.toMatch(/[–—]/);
    });
  });
});
