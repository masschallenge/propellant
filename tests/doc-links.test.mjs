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
import { PLATFORMS } from '../scripts/lib/platforms.mjs';

const [web, office] = PLATFORMS;

const rewriter = createLinkRewriter({ platform: web, ref: 'v1.0.0', platforms: PLATFORMS });
const officeRewriter = createLinkRewriter({
  platform: office,
  ref: 'v1.0.0',
  platforms: PLATFORMS,
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
    expect(pageForPath('docs/brand.md', web.pages, web.patterns)).toBe('brand/reference.md');
    expect(pageForPath('docs/websites/squarespace.md', web.pages, web.patterns)).toBe(
      'web/websites/squarespace.md',
    );
    expect(pageForPath('examples/website.html', web.pages, web.patterns)).toBeNull();
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
    expect(rewriter.rewriteLink('docs/websites/wix.md', '../brand.md#logo')).toBe(
      '/brand/reference/#logo',
    );
    expect(rewriter.rewriteLink('docs/websites.md', 'websites/webflow.md')).toBe(
      '/web/websites/webflow/',
    );
  });

  it('sends other repository files to GitHub at the synced release', () => {
    expect(rewriter.rewriteLink('docs/websites/html.md', '../../examples/website.html')).toBe(
      'https://github.com/masschallenge/propellant-web/blob/v1.0.0/examples/website.html',
    );
  });

  it('links template files for download and keeps guides from another platform on the site', () => {
    expect(
      officeRewriter.rewriteLink('docs/word.md', '../templates/word/propellant-document.dotx'),
    ).toBe(
      'https://github.com/masschallenge/propellant-office/raw/v1.0.0/templates/word/propellant-document.dotx',
    );
    expect(
      officeRewriter.rewriteLink(
        'docs/photography.md',
        'https://github.com/masschallenge/propellant-web/blob/main/docs/images.md',
      ),
    ).toBe('/guidelines/images/');
    expect(officeRewriter.rewriteLink('docs/word.md', 'photography.md')).toBe(
      '/guidelines/photography/',
    );
  });

  it('keeps a link to another platform on GitHub until that page is published', () => {
    const beforeRelease = createLinkRewriter({
      platform: office,
      ref: 'v1.0.0',
      platforms: PLATFORMS,
      hasPage: () => false,
    });
    const href = 'https://github.com/masschallenge/propellant-web/blob/main/docs/images.md';
    expect(beforeRelease.rewriteLink('docs/photography.md', href)).toBe(href);
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
