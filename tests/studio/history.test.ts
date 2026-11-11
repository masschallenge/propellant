import { describe, expect, it } from 'vitest';
import {
  canRedo,
  canUndo,
  createHistory,
  pushHistory,
  redoHistory,
  replacePresent,
  undoHistory,
} from '../../src/studio/history';

describe('history', () => {
  it('undoes and redoes', () => {
    const started = createHistory('first');
    const pushed = pushHistory(pushHistory(started, 'second'), 'third');
    expect(canUndo(pushed)).toBe(true);
    const undone = undoHistory(pushed);
    expect(undone.present).toBe('second');
    expect(canRedo(undone)).toBe(true);
    expect(redoHistory(undone).present).toBe('third');
    expect(undoHistory(started)).toBe(started);
    expect(redoHistory(started)).toBe(started);
  });

  it('coalesces changes with the same key close together', () => {
    const started = createHistory('a');
    const typed = pushHistory(pushHistory(started, 'ab', 'words', 100), 'abc', 'words', 500);
    expect(typed.past).toEqual(['a']);
    const later = pushHistory(typed, 'abcd', 'words', 5000);
    expect(later.past).toEqual(['a', 'abc']);
  });

  it('drops the redo stack on a new change and can replace without history', () => {
    const undone = undoHistory(pushHistory(createHistory('a'), 'b'));
    expect(pushHistory(undone, 'c').future).toEqual([]);
    expect(replacePresent(undone, 'z').past).toEqual([]);
  });
});
