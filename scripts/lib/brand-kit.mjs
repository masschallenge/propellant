import { join } from 'node:path';

export const BRAND_KIT_NAME = 'masschallenge-brand-kit';

export const BRAND_KIT_URL = `/downloads/${BRAND_KIT_NAME}.zip`;

export const brandKitFile = (projectRoot) => join(projectRoot, 'public', BRAND_KIT_URL);

export const BRAND_KIT_FOLDERS = {
  logos: 'logos',
  designSystem: 'design-system-only',
  fonts: 'fonts',
};

export const isLogoFile = (name) => /^masschallenge-logo-.+\.png$/.test(name);

export const isPropellantMarkFile = (name) => /^propellant-.+\.svg$/.test(name);

export const isFontFile = (name) => /\.woff2$/.test(name) || /^OFL-.+\.txt$/.test(name);

const hexToRgbText = (hex) => {
  const digits = hex.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(digits.slice(offset, offset + 2), 16)).join(', ');
};

const cmykText = (cmyk) => (cmyk ? cmyk.join(', ') : null);

const paletteEntry = (color) => ({
  name: color.name,
  hex: color.hex,
  rgb: hexToRgbText(color.hex),
  cmyk: cmykText(color.cmyk),
  printSubstitute: color.printSubstitute ?? null,
  token: color.token ?? null,
  role: color.role,
});

export const colorsJson = ({ brandColors, supportingColors, logoColors, print }) =>
  `${JSON.stringify(
    {
      brandColors: brandColors.map(paletteEntry),
      supportingColors: supportingColors.map(paletteEntry),
      logoColors: logoColors.map((color) => ({
        name: color.name,
        hex: color.hex,
        rgb: hexToRgbText(color.hex),
        cmyk: cmykText(color.cmyk),
        part: color.part,
      })),
      print,
    },
    null,
    2,
  )}\n`;

const colorLines = (color, detail) => [
  color.name,
  `  HEX    ${color.hex}`,
  `  RGB    ${hexToRgbText(color.hex)}`,
  ...(color.cmyk ? [`  CMYK   ${cmykText(color.cmyk)} (approximate)`] : []),
  ...(color.printSubstitute ? [`  Print  ${color.printSubstitute}`] : []),
  ...(color.token ? [`  Token  var(${color.token})`] : []),
  `  ${detail}`,
  '',
];

export const colorsText = ({ brandColors, supportingColors, logoColors, print }) =>
  [
    'MassChallenge colors',
    '',
    'Copy these codes. Never pick a color by eye.',
    '',
    'BRAND PALETTE',
    '',
    ...brandColors.flatMap((color) => colorLines(color, color.role)),
    'SUPPORTING NEUTRALS AND TINT',
    '',
    'For website sections, rules, table lines, secondary text and charts.',
    '',
    ...supportingColors.flatMap((color) => colorLines(color, color.role)),
    'LOGO COLORS',
    '',
    'These belong to the logo files only. Never use them to recolor the logo or for other design.',
    '',
    ...logoColors.flatMap((color) => colorLines(color, `The ${color.part} of the logo`)),
    'PRINT',
    '',
    print.cmyk,
    print.review,
    print.logoFiles,
    '',
  ].join('\n');

export const readmeText = () =>
  [
    'MassChallenge brand kit',
    '',
    'Everything you need to make something on brand. The full guide, with the rules for each',
    'file, is at https://propellant.masschallenge.org/brand/',
    '',
    'logos/',
    '  The MassChallenge horizontal logo and MC mark as PNG files, in three treatments.',
    '  The vertical logo is the default for most layouts, and the horizontal logo is for',
    '  headers, footers, sponsor slides and banners. Vertical and local logo files come from',
    '  MassChallenge Marketing. Use the MC mark where the audience already knows us, such as',
    '  a favicon, an avatar or compact navigation.',
    '  color: on White or Warm White only.',
    '  white: on Navy, Black, Deep Teal, Teal, MC Blue and photos with enough contrast.',
    '  black: for one color printing, and light backgrounds the color logo does not suit.',
    '  Give the logo clear space equal to the height of the M in MASSCHALLENGE on every side.',
    '  Keep the horizontal logo at least 160px wide on screen (30mm in print), and the MC mark',
    '  at least 16px tall on screen (8mm in print).',
    '  Never recolor, stretch, rotate, outline, flip, crop, rebuild or retype it. Always use',
    '  these files.',
    '',
    'design-system-only/',
    '  The Propellant mark, as SVG. It stands for the Propellant design system and nothing',
    '  else. Never use it in place of the MassChallenge logo.',
    '',
    'fonts/',
    '  Propellant Sans (Lato 2.0) and Oswald, as web fonts (.woff2), with their SIL Open Font',
    '  License files. Oswald is for headlines, always in capitals. Lato is for reading text.',
    '  For Word, PowerPoint and Excel, install Lato and Oswald from Google Fonts:',
    '  https://fonts.google.com/specimen/Lato and https://fonts.google.com/specimen/Oswald',
    '  Where they will not load, use Aptos Narrow Bold in capitals for headers and Aptos for',
    '  text. Never Arial.',
    '',
    'colors.txt and colors.json',
    '  The brand palette, the supporting neutrals and the logo colors with HEX, RGB,',
    '  approximate CMYK, print substitutes and Propellant tokens where they exist.',
    '',
  ].join('\n');
