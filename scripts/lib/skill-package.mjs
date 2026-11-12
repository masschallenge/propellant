export const SKILL_NAME = 'propellant-brand';

export const SKILL_TEMPLATES = [
  'templates/word/propellant-document.docx',
  'templates/powerpoint/propellant-presentation.pptx',
  'templates/excel/propellant-workbook.xlsx',
];

export const SKILL_LOGOS = [
  'masschallenge-logo-horizontal-color.png',
  'masschallenge-logo-horizontal-white.png',
  'masschallenge-logo-horizontal-black.png',
  'masschallenge-logo-monogram-color.png',
  'masschallenge-logo-monogram-white.png',
  'masschallenge-logo-monogram-black.png',
];

export const stampVersions = (text, versions) =>
  text.replace(/\{\{(propellant-[a-z]+)\}\}/g, (placeholder, name) => {
    const version = versions[name];
    if (!version) throw new Error(`No release version for ${name}`);
    return version;
  });

const GOOGLE_FONTS =
  "@import url('https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,400;0,700;1,400&family=Oswald:wght@500&display=swap');";

const FONT_OVERRIDES = `:root {
  --type-family: 'Lato', system-ui, sans-serif;
  --type-family-brand: 'Oswald', system-ui, sans-serif;
}`;

export const artifactStylesheet = (websiteCss) => {
  const withoutFontFaces = websiteCss.replace(/@font-face\s*\{[^}]*\}\s*/g, '');
  return [
    '/* propellant-website.css start */',
    GOOGLE_FONTS,
    withoutFontFaces.trim(),
    FONT_OVERRIDES,
    '/* propellant-website.css end */',
    '',
  ].join('\n');
};
