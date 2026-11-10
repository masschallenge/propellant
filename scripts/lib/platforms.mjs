export const WEB_REPOSITORY = 'masschallenge/propellant-web';

export const WEB_DOC_PAGES = {
  'README.md': 'web/index.md',
  'docs/usage.md': 'web/usage.md',
  'docs/websites.md': 'web/websites/index.md',
  'docs/brand.md': 'brand/index.md',
  'docs/images.md': 'guidelines/images.md',
};

export const WEB_DOC_PATTERNS = [
  { pattern: /^docs\/websites\/([a-z0-9-]+)\.md$/, page: (match) => `web/websites/${match[1]}.md` },
];
