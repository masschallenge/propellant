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

const cmykText = (cmyk) => cmyk.join(', ');

export const colorsJson = ({ brandColors, supportingColors, logoColors, print }) =>
  `${JSON.stringify(
    {
      brandColors: brandColors.map((color) => ({
        name: color.name,
        hex: color.hex,
        rgb: hexToRgbText(color.hex),
        cmyk: cmykText(color.cmyk),
        token: color.token,
        role: color.role,
      })),
      supportingColors: supportingColors.map((color) => ({
        name: color.name,
        hex: color.hex,
        rgb: hexToRgbText(color.hex),
        cmyk: cmykText(color.cmyk),
        token: color.token,
        role: color.role,
      })),
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
  `  CMYK   ${cmykText(color.cmyk)}`,
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
    'SUPPORTING NEUTRALS',
    '',
    'For rules, table lines and charts.',
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
    '  The MassChallenge logo as PNG files, in two lockups and three treatments.',
    '  Horizontal is the default. Use the monogram only in small spaces, such as a favicon or',
    '  an avatar, where the MassChallenge name is already clear.',
    '  color: on white and light backgrounds.',
    '  white: on Deep teal, dark backgrounds and dark, calm parts of photos.',
    '  black: for one color printing.',
    '  Give the logo clear space of half its height on every side. Keep the horizontal logo at',
    '  least 24px tall on screen, and the monogram at least 16px.',
    '  Never stretch, recolor, redraw, outline or crop it. Always use these files.',
    '',
    'design-system-only/',
    '  The Propellant mark, as SVG. It stands for the Propellant design system and nothing',
    '  else. Never use it in place of the MassChallenge logo.',
    '',
    'fonts/',
    '  Propellant Sans (Lato 2.0) and Oswald, as web fonts (.woff2), with their SIL Open Font',
    '  License files. Lato is for everything. Oswald is only for big display headlines, set in',
    '  capitals. For Word, PowerPoint and Excel, install Lato and Oswald from Google Fonts:',
    '  https://fonts.google.com/specimen/Lato and https://fonts.google.com/specimen/Oswald',
    '',
    'colors.txt and colors.json',
    '  The brand palette, the supporting neutrals and the logo colors with HEX, RGB, print CMYK',
    '  and the Propellant token for each, and how the CMYK values were calculated.',
    '',
  ].join('\n');
