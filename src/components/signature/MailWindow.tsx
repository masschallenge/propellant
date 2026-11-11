import { useId } from 'react';

interface MailWindowProps {
  theme: 'light' | 'dark';
  html: string;
}

const DARK_MAIL_STYLES = `
[data-mail-theme='dark'] [data-mail-body] td,
[data-mail-theme='dark'] [data-mail-body] span {
  color: var(--gray-75) !important;
}
[data-mail-theme='dark'] [data-mail-body] a {
  color: var(--teal-300) !important;
}
`;

const MailWindow = ({ theme, html }: MailWindowProps) => {
  const headingId = useId();
  const isDark = theme === 'dark';
  return (
    <figure
      className="m-0 flex min-w-0 flex-col gap-2"
      aria-labelledby={headingId}
      data-mail-theme={theme}
    >
      {isDark ? <style>{DARK_MAIL_STYLES}</style> : null}
      <div
        data-theme={theme}
        className="overflow-hidden rounded-[var(--corner-lg)] bg-[var(--bg)] text-[var(--label)] shadow-[0_0_0_1px_var(--separator),var(--shadow-float)]"
      >
        <div
          className="flex items-center gap-1.5 border-0 border-b border-solid border-[var(--separator)] bg-[var(--bg-secondary)] px-3 py-2"
          aria-hidden="true"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--fill)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--fill)]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--fill)]" />
          <span className="ml-2 text-caption text-[var(--label-secondary)]">New message</span>
        </div>
        <dl className="m-0 border-0 border-b border-solid border-[var(--separator)] px-4 py-2 text-footnote">
          <div className="flex gap-2 py-0.5">
            <dt className="text-[var(--label-secondary)]">To</dt>
            <dd className="m-0">A founder</dd>
          </div>
          <div className="flex gap-2 py-0.5">
            <dt className="text-[var(--label-secondary)]">Subject</dt>
            <dd className="m-0">Your application</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-3 px-4 py-4">
          <p className="m-0 text-callout">Hi,</p>
          <span
            aria-hidden="true"
            className="block h-2 w-11/12 rounded-full bg-[var(--fill-secondary)]"
          />
          <span
            aria-hidden="true"
            className="block h-2 w-3/4 rounded-full bg-[var(--fill-secondary)]"
          />
          <p className="m-0 mb-1 text-callout">Thanks,</p>
          <div
            data-mail-body
            className="overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
      <figcaption id={headingId} className="text-footnote text-[var(--label-secondary)]">
        {isDark
          ? 'In a dark mail app. Apps change colors in different ways; many lighten dark text like this.'
          : 'In a light mail app.'}
      </figcaption>
    </figure>
  );
};

export default MailWindow;
