import { describe, expect, it } from 'vitest';
import {
  excerpt,
  fileNameFromLine,
  isAllCaps,
  toSentenceCase,
  wrapText,
} from '../../src/studio/text';
import { fakeMeasure } from './helpers';

describe('wrapText', () => {
  it('wraps words greedily to the width', () => {
    const lines = wrapText('one two three four', 10 * 0.55 * 9, '10px sans', fakeMeasure);
    expect(lines).toEqual(['one two', 'three', 'four']);
  });

  it('keeps line breaks and breaks words longer than the line', () => {
    expect(wrapText('first\nsecond', 1000, '10px sans', fakeMeasure)).toEqual(['first', 'second']);
    expect(wrapText('abcdefghij', 10 * 0.55 * 4, '10px sans', fakeMeasure)).toEqual([
      'abcd',
      'efgh',
      'ij',
    ]);
    expect(wrapText('', 100, '10px sans', fakeMeasure)).toEqual(['']);
  });
});

describe('case helpers', () => {
  it('knows all caps text', () => {
    expect(isAllCaps("DON'T MISS OUT")).toBe(true);
    expect(isAllCaps('Apply by NOV 1')).toBe(false);
    expect(isAllCaps('A')).toBe(false);
    expect(isAllCaps('2026')).toBe(false);
  });

  it('turns all caps into sentence case and keeps names', () => {
    expect(toSentenceCase("DON'T MISS OUT")).toBe("Don't miss out");
    expect(toSentenceCase('JOIN MASSCHALLENGE. I WILL BE THERE!')).toBe(
      'Join MassChallenge. I will be there!',
    );
  });

  it('shortens long text and names files from the big line', () => {
    expect(excerpt('a'.repeat(50), 10)).toBe('aaaaaaaaa...');
    expect(fileNameFromLine("Demo Day: Don't miss it!")).toBe('demo-day-dont-miss-it.png');
    expect(fileNameFromLine('   ')).toBe('masschallenge-post.png');
  });
});
