import { describe, expect, it } from 'vitest';
import {
  compareVersions,
  createLinkRewriter,
  pageForPath,
  resolveRepositoryPath,
  rewriteMarkdown,
  routeForPage,
  toStarlightPage,
} from '../scripts/lib/doc-links.mjs';
import { WEB_DOC_PAGES, WEB_DOC_PATTERNS, WEB_REPOSITORY } from '../scripts/lib/platforms.mjs';

const rewriter = createLinkRewriter({
  repository: WEB_REPOSITORY,
  ref: 'v1.0.0',
  pages: WEB_DOC_PAGES,
  patterns: WEB_DOC_PATTERNS,
});

describe('resolveRepositoryPath', () => {
  it('resolves links relative to the document that contains them', () => {
    expect(resolveRepositoryPath('docs/websites/wix.md', '../brand.md')).toBe('docs/brand.md');
    expect(resolveRepositoryPath('docs/websites/html.md', '../../examples/website.html')).toBe(
      'examples/website.html',
    );
    expect(resolveRepositoryPath('README.md', 'docs/usage.md')).toBe('docs/usage.md');
  });
});

describe('pageForPath and routeForPage', () => {
  it('maps every web guide to its page on the site', () => {
    expect(pageForPath('docs/brand.md', WEB_DOC_PAGES, WEB_DOC_PATTERNS)).toBe('brand/index.md');
    expect(pageForPath('docs/websites/squarespace.md', WEB_DOC_PAGES, WEB_DOC_PATTERNS)).toBe(
      'web/websites/squarespace.md',
    );
    expect(pageForPath('examples/website.html', WEB_DOC_PAGES, WEB_DOC_PATTERNS)).toBeNull();
  });

  it('turns page files into clean routes', () => {
    expect(routeForPage('web/index.md')).toBe('/web/');
    expect(routeForPage('web/websites/index.md')).toBe('/web/websites/');
    expect(routeForPage('web/websites/wix.md')).toBe('/web/websites/wix/');
    expect(routeForPage('guidelines/images.md')).toBe('/guidelines/images/');
  });
});

describe('createLinkRewriter', () => {
  it('points links between guides at site routes and keeps their anchors', () => {
    expect(rewriter.rewriteLink('docs/websites/wix.md', '../brand.md#logo')).toBe('/brand/#logo');
    expect(rewriter.rewriteLink('docs/websites.md', 'websites/webflow.md')).toBe(
      '/web/websites/webflow/',
    );
  });

  it('sends other repository files to GitHub at the synced release', () => {
    expect(rewriter.rewriteLink('docs/websites/html.md', '../../examples/website.html')).toBe(
      'https://github.com/masschallenge/propellant-web/blob/v1.0.0/examples/website.html',
    );
  });

  it('leaves absolute links and in-page anchors alone', () => {
    expect(rewriter.rewriteLink('docs/usage.md', 'https://example.com/a')).toBe(
      'https://example.com/a',
    );
    expect(rewriter.rewriteLink('docs/usage.md', '#install')).toBe('#install');
  });

  it('serves images from the CDN at the synced release', () => {
    expect(rewriter.rewriteAsset('README.md', 'assets/brand/propellant-mark-color.svg')).toBe(
      'https://cdn.jsdelivr.net/gh/masschallenge/propellant-web@v1.0.0/assets/brand/propellant-mark-color.svg',
    );
  });
});

describe('rewriteMarkdown', () => {
  it('rewrites links, images and HTML sources outside code blocks only', () => {
    const markdown = [
      'See the [spec](../websites.md) and ![mark](../../assets/brand/propellant-mark-color.svg).',
      '<img src="../../assets/logo.png" alt="" />',
      '```html',
      '<a href="../websites.md">untouched</a> [kept](../websites.md)',
      '```',
    ].join('\n');
    const rewritten = rewriteMarkdown(markdown, 'docs/websites/wix.md', rewriter);
    expect(rewritten).toContain('[spec](/web/websites/)');
    expect(rewritten).toContain(
      '![mark](https://cdn.jsdelivr.net/gh/masschallenge/propellant-web@v1.0.0/assets/brand/propellant-mark-color.svg)',
    );
    expect(rewritten).toContain(
      'src="https://cdn.jsdelivr.net/gh/masschallenge/propellant-web@v1.0.0/assets/logo.png"',
    );
    expect(rewritten).toContain('[kept](../websites.md)');
  });
});

describe('toStarlightPage', () => {
  it('moves the first heading into the title and drops the README picture', () => {
    const page = toStarlightPage(
      '<picture>\n<img src="x" />\n</picture>\n\n# Propellant for the web\n\nBody text.\n',
      {
        editUrl: 'https://github.com/masschallenge/propellant-web/edit/main/README.md',
        sourceLabel: 'README.md',
      },
    );
    expect(page).toBe(
      '---\ntitle: "Propellant for the web"\neditUrl: "https://github.com/masschallenge/propellant-web/edit/main/README.md"\n---\n\nBody text.\n',
    );
  });

  it('refuses a page with no heading', () => {
    expect(() =>
      toStarlightPage('No heading here', { editUrl: 'x', sourceLabel: 'docs/empty.md' }),
    ).toThrow('docs/empty.md');
  });
});

describe('compareVersions', () => {
  it('orders release tags by version, not alphabetically', () => {
    expect(['v1.10.0', 'v1.2.0', 'v1.0.0', 'v2.0.0'].sort(compareVersions)).toEqual([
      'v1.0.0',
      'v1.2.0',
      'v1.10.0',
      'v2.0.0',
    ]);
  });
});
