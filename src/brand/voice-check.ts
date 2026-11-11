export type VoiceIssueKind =
  | 'buzzword'
  | 'exclamation'
  | 'dash'
  | 'oops'
  | 'title-case'
  | 'mc-word'
  | 'name-spelling';

export interface VoiceIssue {
  kind: VoiceIssueKind;
  match: string;
  start: number;
  end: number;
  rule: string;
  fix: string;
}

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);

export const VOICE_RULES: Record<VoiceIssueKind, string> = {
  buzzword:
    'Be confident without hype. Skip buzzwords such as leverage, seamless and robust, and skip exclamation marks.',
  exclamation:
    'Be confident without hype. Skip buzzwords such as leverage, seamless and robust, and skip exclamation marks.',
  dash: 'Use commas, colons and periods. Do not use em dashes or en dashes.',
  oops: 'When something goes wrong, say what happened and how to fix it. Do not apologize or blame.',
  'title-case': 'Use sentence case for every title, label and button.',
  'mc-word': 'Do not abbreviate it to MC in running text. The MC monogram is a logo, not a word.',
  'name-spelling': 'Write MassChallenge as one word with a capital M and a capital C.',
};

const MINOR_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'but',
  'by',
  'for',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'with',
]);

const PROPER_NOUNS = new Set(['MassChallenge', 'Propellant', 'Oswald', 'Lato']);

const SHORT_LABEL_WORDS = 6;

interface PatternRule {
  kind: VoiceIssueKind;
  pattern: RegExp;
  fix: (match: string) => string;
  accept?: (match: string) => boolean;
}

const PATTERN_RULES: PatternRule[] = [
  {
    kind: 'buzzword',
    pattern: /\b(?:leverag\w*|seamless\w*|robust\w*)/gi,
    fix: (match) => `Say what "${match}" really means in everyday words.`,
  },
  {
    kind: 'exclamation',
    pattern: /!+/g,
    fix: () => 'End with a period.',
  },
  {
    kind: 'dash',
    pattern: new RegExp(`[${EM_DASH}${EN_DASH}]`, 'g'),
    fix: () => 'Use a comma, a colon or a period instead.',
  },
  {
    kind: 'oops',
    pattern: /\boops\b/gi,
    fix: () => 'Say what happened and how to fix it.',
  },
  {
    kind: 'mc-word',
    pattern: /\bMC\b/g,
    fix: () => 'Write MassChallenge in full.',
  },
  {
    kind: 'name-spelling',
    pattern: /\bmass\s*challenge\b/gi,
    accept: (match) => match === 'MassChallenge',
    fix: () => 'Write MassChallenge.',
  },
];

const patternIssues = (text: string): VoiceIssue[] =>
  PATTERN_RULES.flatMap((rule) =>
    [...text.matchAll(rule.pattern)]
      .filter((found) => !rule.accept?.(found[0]))
      .map((found) => ({
        kind: rule.kind,
        match: found[0],
        start: found.index ?? 0,
        end: (found.index ?? 0) + found[0].length,
        rule: VOICE_RULES[rule.kind],
        fix: rule.fix(found[0]),
      })),
  );

const startsUpper = (word: string): boolean => /^[A-Z]/.test(word);
const isAcronym = (word: string): boolean => /^[A-Z0-9]{2,}$/.test(word);
const bareWord = (word: string): string => word.replace(/^[^\w]+|[^\w]+$/g, '');

export const isTitleCase = (line: string): boolean => {
  const trimmed = line.trim();
  if (/[.?]$/.test(trimmed)) return false;
  const words = trimmed.split(/\s+/).map(bareWord).filter(Boolean);
  if (words.length < 2 || words.length > SHORT_LABEL_WORDS) return false;
  const laterWords = words
    .slice(1)
    .filter((word) => !MINOR_WORDS.has(word.toLowerCase()))
    .filter((word) => !PROPER_NOUNS.has(word) && !isAcronym(word));
  return laterWords.length > 0 && laterWords.every(startsUpper);
};

const titleCaseIssues = (text: string): VoiceIssue[] => {
  const issues: VoiceIssue[] = [];
  let offset = 0;
  text.split('\n').forEach((line) => {
    if (isTitleCase(line)) {
      const leading = line.length - line.trimStart().length;
      const trimmed = line.trim();
      issues.push({
        kind: 'title-case',
        match: trimmed,
        start: offset + leading,
        end: offset + leading + trimmed.length,
        rule: VOICE_RULES['title-case'],
        fix: 'Capitalize only the first word and names.',
      });
    }
    offset += line.length + 1;
  });
  return issues;
};

export const checkVoice = (text: string): VoiceIssue[] =>
  [...patternIssues(text), ...titleCaseIssues(text)].sort(
    (first, second) => first.start - second.start || first.end - second.end,
  );

export interface TextSegment {
  text: string;
  issue: VoiceIssue | null;
}

export const segmentText = (text: string, issues: VoiceIssue[]): TextSegment[] => {
  const segments: TextSegment[] = [];
  let cursor = 0;
  issues
    .filter((issue) => issue.kind !== 'title-case')
    .forEach((issue) => {
      if (issue.start < cursor) return;
      if (issue.start > cursor)
        segments.push({ text: text.slice(cursor, issue.start), issue: null });
      segments.push({ text: text.slice(issue.start, issue.end), issue });
      cursor = issue.end;
    });
  if (cursor < text.length) segments.push({ text: text.slice(cursor), issue: null });
  return segments;
};
