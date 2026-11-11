import { Button, SegmentedControl } from '@masschallenge/propellant-web';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { copyText } from '../../../brand/clipboard';

export type PreviewTheme = 'light' | 'dark';

const THEME_ITEMS = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export const pageTheme = (): PreviewTheme => {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === 'light' || chosen === 'dark') return chosen;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

interface ThemedPreviewProps {
  title: string;
  description: string;
  code: string;
  surface?: 'plain' | 'grouped';
  children: ReactNode;
}

export const ThemedPreview = ({
  title,
  description,
  code,
  surface = 'plain',
  children,
}: ThemedPreviewProps) => {
  const headingId = useId();
  const [theme, setTheme] = useState<PreviewTheme>('light');
  const [status, setStatus] = useState('');
  const clearTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    setTheme(pageTheme());
    return () => window.clearTimeout(clearTimer.current);
  }, []);

  const handleCopy = async () => {
    const isCopied = await copyText(code);
    setStatus(
      isCopied ? `Copied the ${title} code` : 'Copying is blocked here. Select the code instead.',
    );
    window.clearTimeout(clearTimer.current);
    clearTimer.current = window.setTimeout(() => setStatus(''), 2500);
  };

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-w-0 flex-col overflow-hidden rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)]"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div className="min-w-0">
          <h3 id={headingId} className="m-0 text-headline text-[var(--label)]">
            {title}
          </h3>
          <p className="m-0 mt-1 text-subheadline text-[var(--label-secondary)]">{description}</p>
        </div>
        <SegmentedControl
          size="sm"
          aria-label={`${title} preview theme`}
          items={THEME_ITEMS}
          value={theme}
          onChange={(id) => setTheme(id as PreviewTheme)}
        />
      </div>
      <div
        data-theme={theme}
        className={`mx-5 flex min-h-[148px] items-center justify-center rounded-[var(--corner-lg)] p-6 text-[var(--label)] ${
          surface === 'grouped'
            ? 'bg-[var(--bg-grouped)]'
            : 'bg-[var(--bg)] shadow-[inset_0_0_0_1px_var(--separator)]'
        }`}
      >
        <div className="w-full min-w-0">{children}</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-0 border-t border-solid border-[var(--separator)] px-5 py-3">
        <p aria-live="polite" className="m-0 min-h-5 text-footnote text-[var(--label-secondary)]">
          {status}
        </p>
        <Button size="sm" variant="tinted" onClick={handleCopy}>
          Copy code
        </Button>
      </div>
      <pre className="m-0 max-h-64 overflow-auto bg-[var(--bg-secondary)] px-5 py-4 text-footnote leading-[1.6] text-[var(--label)]">
        <code className="font-[family-name:var(--type-family-mono)]">{code}</code>
      </pre>
    </section>
  );
};
