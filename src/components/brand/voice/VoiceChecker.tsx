import * as React from 'react';
import { Textarea } from '@masschallenge/propellant-web';
import { checkVoice, segmentText } from '../../../brand/voice-check';
import type { VoiceIssue } from '../../../brand/voice-check';

const ISSUE_NAME: Record<VoiceIssue['kind'], string> = {
  buzzword: 'Buzzword',
  exclamation: 'Exclamation mark',
  dash: 'Dash',
  oops: 'Oops',
  'title-case': 'Title Case',
  'mc-word': 'MC as a word',
  'name-spelling': 'Name spelled wrongly',
};

const STARTER =
  'Oops! Our robust Mass Challenge portal lets you leverage MC mentors.\nSubmit Application';

const VoiceChecker = () => {
  const [text, setText] = React.useState(STARTER);
  const issues = React.useMemo(() => checkVoice(text), [text]);
  const segments = React.useMemo(() => segmentText(text, issues), [text, issues]);
  const summary = issues.length
    ? `${issues.length} ${issues.length === 1 ? 'thing' : 'things'} to fix`
    : 'Nothing to fix. It reads on brand.';

  return (
    <div className="grid gap-6 rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-5 sm:p-6 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Textarea
          label="Your words"
          hint="Paste or type a button, a heading or a paragraph. It is checked as you type and stays in your browser."
          value={text}
          rows={6}
          onChange={(event) => setText(event.target.value)}
        />
        <div>
          <p className="m-0 mb-2 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--label-secondary)]">
            Marked up
          </p>
          <p className="m-0 min-h-[3rem] whitespace-pre-wrap break-words rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] p-3 text-[length:var(--type-body-size)] leading-[1.8] text-[var(--label)]">
            {segments.map((segment, index) =>
              segment.issue ? (
                <mark
                  key={index}
                  className="rounded-[var(--corner-sm)] bg-[var(--highlight)] px-0.5 text-[var(--on-highlight)] underline decoration-[var(--critical-solid)] decoration-wavy underline-offset-4"
                >
                  {segment.text}
                </mark>
              ) : (
                <React.Fragment key={index}>{segment.text}</React.Fragment>
              ),
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p
          className="m-0 text-[length:var(--type-title3-size)] font-semibold text-[var(--label)]"
          aria-live="polite"
        >
          {summary}
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {issues.map((issue) => (
            <li
              key={`${issue.kind}-${issue.start}`}
              className="flex flex-col gap-1 rounded-[var(--corner-lg)] border border-solid border-[var(--separator)] p-3"
            >
              <span className="flex flex-wrap items-center gap-2 text-[length:var(--type-callout-size)]">
                <span className="font-semibold text-[var(--critical)]">
                  {ISSUE_NAME[issue.kind]}
                </span>
                <code className="rounded-[var(--corner-sm)] bg-[var(--fill-secondary)] px-1.5 font-[family-name:var(--type-family-mono)] text-[length:var(--type-footnote-size)] text-[var(--label)]">
                  {issue.match}
                </code>
              </span>
              <span className="text-[length:var(--type-callout-size)] text-[var(--label)]">
                {issue.fix}
              </span>
              <span className="text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
                Rule: {issue.rule}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default VoiceChecker;
