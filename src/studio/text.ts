export type MeasureText = (text: string, font: string) => number;

const breakLongWord = (word: string, maxWidth: number, font: string, measure: MeasureText) => {
  const pieces: string[] = [];
  let current = '';
  Array.from(word).forEach((character) => {
    const candidate = current + character;
    if (current && measure(candidate, font) > maxWidth) {
      pieces.push(current);
      current = character;
    } else {
      current = candidate;
    }
  });
  if (current) pieces.push(current);
  return pieces;
};

const wrapParagraph = (
  paragraph: string,
  maxWidth: number,
  font: string,
  measure: MeasureText,
): string[] => {
  const words = paragraph.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (measure(candidate, font) <= maxWidth) {
      current = candidate;
      return;
    }
    if (current) lines.push(current);
    if (measure(word, font) > maxWidth) {
      const pieces = breakLongWord(word, maxWidth, font, measure);
      lines.push(...pieces.slice(0, -1));
      current = pieces[pieces.length - 1] ?? '';
    } else {
      current = word;
    }
  });
  lines.push(current);
  return lines;
};

export const wrapText = (
  text: string,
  maxWidth: number,
  font: string,
  measure: MeasureText,
): string[] =>
  text.split('\n').flatMap((paragraph) => wrapParagraph(paragraph, maxWidth, font, measure));

export const isAllCaps = (text: string): boolean => {
  const letters = text.match(/\p{L}/gu) ?? [];
  return (
    letters.length >= 2 &&
    letters.every((letter) => letter === letter.toUpperCase()) &&
    letters.some((letter) => letter !== letter.toLowerCase())
  );
};

const PROPER_NAMES = ['MassChallenge', 'LinkedIn', 'Instagram'];

export const toSentenceCase = (text: string): string => {
  const lowered = text.toLowerCase();
  const capitalized = lowered.replace(
    /(^\s*|[.!?]\s+|\n\s*)(\p{L})/gu,
    (_match, lead: string, letter: string) => `${lead}${letter.toUpperCase()}`,
  );
  const withPronoun = capitalized.replace(/\bi\b/g, 'I');
  return PROPER_NAMES.reduce(
    (current, name) => current.replace(new RegExp(`\\b${name}\\b`, 'gi'), name),
    withPronoun,
  );
};

export const excerpt = (text: string, length = 40): string => {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > length ? `${flat.slice(0, length - 1).trimEnd()}...` : flat;
};

export const fileNameFromLine = (line: string): string => {
  const slug = line
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
  return `${slug || 'masschallenge-post'}.png`;
};
