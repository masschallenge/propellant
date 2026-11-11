import { describe, expect, it } from 'vitest';
import { checkVoice, isTitleCase, segmentText } from '../../src/brand/voice-check';

const EM_DASH = String.fromCharCode(0x2014);
const EN_DASH = String.fromCharCode(0x2013);

const kinds = (text: string) => checkVoice(text).map((issue) => issue.kind);

describe('voice checker', () => {
  it('passes plain, direct copy', () => {
    expect(checkVoice('Find mentors who know your market.')).toEqual([]);
    expect(
      checkVoice('We could not save your changes. Check your connection and try again.'),
    ).toEqual([]);
  });

  it('flags the reference example of what not to write', () => {
    expect(
      kinds("Leverage our seamless platform to unlock your startup's full potential!"),
    ).toEqual(['buzzword', 'buzzword', 'exclamation']);
  });

  it('flags buzzword variants regardless of case', () => {
    expect(kinds('A robustly built tool for leveraging data')).toEqual(['buzzword', 'buzzword']);
  });

  it('flags oops, exclamation marks and dashes', () => {
    expect(kinds('Oops! Something went wrong.')).toEqual(['oops', 'exclamation']);
    expect(kinds(`Apply now ${EM_DASH} today`)).toEqual(['dash']);
    expect(kinds(`Pages 4${EN_DASH}5.`)).toEqual(['dash']);
  });

  it('flags MC as a word but not inside other words', () => {
    expect(kinds('Join the MC community.')).toEqual(['mc-word']);
    expect(kinds('MCMXC is a year in numerals.')).toEqual([]);
  });

  it('flags MassChallenge spelled wrongly', () => {
    expect(kinds('Welcome to Mass Challenge.')).toEqual(['name-spelling']);
    expect(kinds('Welcome to Masschallenge.')).toEqual(['name-spelling']);
    expect(kinds('Welcome to MassChallenge.')).toEqual([]);
  });

  it('flags Title Case in short labels only', () => {
    expect(isTitleCase('Submit Application')).toBe(true);
    expect(isTitleCase('Terms of Service')).toBe(true);
    expect(isTitleCase('Submit application')).toBe(false);
    expect(isTitleCase('Visit MassChallenge')).toBe(false);
    expect(isTitleCase('Save')).toBe(false);
    expect(isTitleCase('Read The Whole Thing Before You Start Today')).toBe(false);
    expect(isTitleCase('Meet The Team.')).toBe(false);
    expect(kinds('Save changes\nSave Changes')).toEqual(['title-case']);
  });

  it('reports where each issue sits and the rule it breaks', () => {
    const text = 'Save Changes\nOops';
    const [titleIssue, oopsIssue] = checkVoice(text);
    expect(text.slice(titleIssue.start, titleIssue.end)).toBe('Save Changes');
    expect(text.slice(oopsIssue.start, oopsIssue.end)).toBe('Oops');
    expect(oopsIssue.rule).toMatch(/Do not apologize/);
  });

  it('splits text into plain and flagged segments that rebuild the text', () => {
    const text = 'Oops! Leverage it.';
    const segments = segmentText(text, checkVoice(text));
    expect(segments.map((segment) => segment.text).join('')).toBe(text);
    expect(segments.filter((segment) => segment.issue)).toHaveLength(3);
  });
});
