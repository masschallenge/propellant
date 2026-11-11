export const BRAND_KIT_NAME = 'masschallenge-brand-kit';

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

export const colorsJson = ({ brandColors, logoColors }) =>
  `${JSON.stringify(
    {
      brandColors: brandColors.map((color) => ({
        name: color.name,
        hex: color.hex,
        rgb: hexToRgbText(color.hex),
        token: color.token,
        role: color.role,
      })),
      logoColors: logoColors.map((color) => ({
        name: color.name,
        hex: color.hex,
        rgb: hexToRgbText(color.hex),
        part: color.part,
      })),
    },
    null,
    2,
  )}\n`;

const colorLines = (color, detail) => [
  color.name,
  `  HEX    ${color.hex}`,
  `  RGB    ${hexToRgbText(color.hex)}`,
  ...(color.token ? [`  Token  var(${color.token})`] : []),
  `  ${detail}`,
  '',
];

export const colorsText = ({ brandColors, logoColors }) =>
  [
    'MassChallenge colors',
    '',
    'Copy these codes. Never pick a color by eye.',
    '',
    'BRAND PALETTE',
    '',
    ...brandColors.flatMap((color) => colorLines(color, color.role)),
    'LOGO COLORS',
    '',
    'These belong to the logo files only. Never use them to recolor the logo or for other design.',
    '',
    ...logoColors.flatMap((color) => colorLines(color, `The ${color.part} of the logo`)),
    'There are no official CMYK or Pantone values yet. Ask the brand team before you print.',
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
    '  Never stretch, recolor, redraw, outline or crop it. There is no vector original of the',
    '  MassChallenge logo, so always use these files.',
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
    '  The brand palette and the logo colors with HEX, RGB and the Propellant token for each.',
    '',
  ].join('\n');
