export interface ClipboardLike {
  writeText: (text: string) => Promise<void>;
  write?: (items: ClipboardItem[]) => Promise<void>;
}

type ClipboardItemMaker = (parts: Record<string, Blob>) => ClipboardItem;

const browserClipboard = (): ClipboardLike | undefined =>
  typeof navigator === 'undefined' ? undefined : navigator.clipboard;

const browserItemMaker = (): ClipboardItemMaker | undefined =>
  typeof ClipboardItem === 'undefined' ? undefined : (parts) => new ClipboardItem(parts);

export const copyText = async (text: string, clipboard = browserClipboard()) => {
  if (!clipboard) return false;
  try {
    await clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const copyRich = async (
  html: string,
  text: string,
  clipboard = browserClipboard(),
  makeItem = browserItemMaker(),
) => {
  if (!clipboard) return false;
  if (!clipboard.write || !makeItem) return copyText(text, clipboard);
  try {
    await clipboard.write([
      makeItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    return true;
  } catch {
    return false;
  }
};
