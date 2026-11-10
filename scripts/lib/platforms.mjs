export const PLATFORMS = [
  {
    id: 'web',
    repository: 'masschallenge/propellant-web',
    isRequired: true,
    providesBrandAssets: true,
    pages: {
      'README.md': 'web/index.md',
      'docs/usage.md': 'web/usage.md',
      'docs/websites.md': 'web/websites/index.md',
      'docs/brand.md': 'brand/index.md',
      'docs/images.md': 'guidelines/images.md',
    },
    patterns: [
      {
        pattern: /^docs\/websites\/([a-z0-9-]+)\.md$/,
        page: (match) => `web/websites/${match[1]}.md`,
      },
    ],
  },
  {
    id: 'office',
    repository: 'masschallenge/propellant-office',
    isRequired: true,
    providesBrandAssets: false,
    pages: {
      'README.md': 'office/index.md',
      'docs/foundations.md': 'office/foundations.md',
      'docs/templates.md': 'office/templates.md',
      'docs/word.md': 'office/word.md',
      'docs/powerpoint.md': 'office/powerpoint.md',
      'docs/excel.md': 'office/excel.md',
      'docs/google-docs.md': 'office/google-docs.md',
      'docs/google-slides.md': 'office/google-slides.md',
      'docs/google-sheets.md': 'office/google-sheets.md',
      'docs/photography.md': 'guidelines/photography.md',
    },
    patterns: [],
  },
];
