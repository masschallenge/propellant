import { describe, expect, it, vi } from 'vitest';
import { copyRich, copyText } from '../../src/brand/clipboard';

describe('copyText', () => {
  it('writes plain text and reports success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await copyText('#044451', { writeText })).toBe(true);
    expect(writeText).toHaveBeenCalledWith('#044451');
  });

  it('reports failure instead of throwing', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    expect(await copyText('a', { writeText })).toBe(false);
    expect(await copyText('a', undefined)).toBe(false);
  });
});

describe('copyRich', () => {
  it('writes HTML and plain text together', async () => {
    const write = vi.fn().mockResolvedValue(undefined);
    const makeItem = vi.fn((parts: Record<string, Blob>) => parts as unknown as ClipboardItem);
    const writeText = vi.fn();
    expect(await copyRich('<b>Hi</b>', 'Hi', { write, writeText }, makeItem)).toBe(true);
    const parts = makeItem.mock.calls[0][0];
    expect(Object.keys(parts)).toEqual(['text/html', 'text/plain']);
    expect(await parts['text/html'].text()).toBe('<b>Hi</b>');
    expect(await parts['text/plain'].text()).toBe('Hi');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('falls back to plain text where rich copying is not supported', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await copyRich('<b>Hi</b>', 'Hi', { writeText }, undefined)).toBe(true);
    expect(writeText).toHaveBeenCalledWith('Hi');
  });

  it('reports failure when the browser refuses', async () => {
    const write = vi.fn().mockRejectedValue(new Error('denied'));
    const makeItem = (parts: Record<string, Blob>) => parts as unknown as ClipboardItem;
    expect(await copyRich('<b>Hi</b>', 'Hi', { write, writeText: vi.fn() }, makeItem)).toBe(false);
  });
});
