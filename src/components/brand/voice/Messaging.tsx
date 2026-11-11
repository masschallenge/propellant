import { Badge, Banner, Button } from '@masschallenge/propellant-web';
import {
  ABOUT_URL,
  ACCELERATORS,
  APPROVED_FIGURES,
  AUDIENCES,
  BOILERPLATES,
  CHALLENGE_AREAS,
  HOME_URL,
  JOBS_CONFLICT,
  MESSAGING_AS_OF,
  MISATTRIBUTED_LINE,
  MISATTRIBUTION_NOTE,
  PARTNERSHIP_OFFER,
  POSITIONING,
  PRIMARY_LINE,
  PRODUCT_WORDS,
  wordCount,
} from '../../../brand/messaging';
import { CopyIcon } from '../logo/icons';
import { useCopyToast } from '../color/useCopyToast';

const CARD =
  'flex flex-col gap-3 rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-5';

const EYEBROW =
  'm-0 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--label-secondary)]';

const SOURCE_LINK = 'text-[var(--tint)] underline-offset-4 hover:underline';

interface CopyButtonProps {
  label: string;
  onCopy: () => void;
}

const CopyButton = ({ label, onCopy }: CopyButtonProps) => (
  <Button size="sm" variant="tinted" iconLeading={<CopyIcon />} onClick={onCopy}>
    {label}
  </Button>
);

interface WordListProps {
  title: string;
  words: string[];
  note: string;
}

const WordList = ({ title, words, note }: WordListProps) => (
  <article className={CARD}>
    <h4 className="m-0 text-[length:var(--type-title3-size)] font-semibold text-[var(--label)]">
      {title}
    </h4>
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {words.map((word) => (
        <li key={word}>
          <Badge size="md">{word}</Badge>
        </li>
      ))}
    </ul>
    <p className="m-0 text-[length:var(--type-callout-size)] leading-[var(--type-callout-line)] text-[var(--label-secondary)]">
      {note}
    </p>
  </article>
);

const Messaging = () => {
  const { copy, toast } = useCopyToast();
  const copyLine = (text: string, name: string) => {
    void copy(text, name);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="flex flex-col gap-4 rounded-[var(--corner-xl)] bg-[var(--teal-900)] p-6 text-[var(--gray-0)]">
          <p className="m-0 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--teal-100)]">
            Primary line
          </p>
          <p className="m-0 font-[family-name:var(--type-family-brand)] text-[clamp(1.6rem,3.4vw,2.4rem)] font-medium uppercase leading-[1.05]">
            {PRIMARY_LINE}
          </p>
          <p className="m-0 text-[length:var(--type-footnote-size)] text-[var(--teal-100)]">
            From the{' '}
            <a href={HOME_URL} className="text-[var(--gray-0)] underline underline-offset-4">
              home page hero
            </a>
            .
          </p>
          <div data-theme="dark" className="bg-transparent">
            <Button
              size="sm"
              variant="gray"
              iconLeading={<CopyIcon />}
              onClick={() => copyLine(PRIMARY_LINE, 'the primary line')}
            >
              Copy the primary line
            </Button>
          </div>
        </article>
        <article className={CARD}>
          <p className={EYEBROW}>Positioning</p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {POSITIONING.map((line) => (
              <li
                key={line}
                className="text-[length:var(--type-title3-size)] font-semibold leading-[1.35] text-[var(--label)]"
              >
                {line}
              </li>
            ))}
          </ul>
          <p className="m-0 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            From the{' '}
            <a href={ABOUT_URL} className={SOURCE_LINK}>
              About page
            </a>
            .
          </p>
          <div className="mt-auto">
            <CopyButton
              label="Copy the positioning"
              onCopy={() => copyLine(POSITIONING.join(' '), 'the positioning')}
            />
          </div>
        </article>
      </div>

      <div>
        <h4 className="m-0 mb-1 text-[length:var(--type-title2-size)] font-semibold text-[var(--label)]">
          Boilerplate
        </h4>
        <p className="m-0 mb-4 max-w-[68ch] text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
          Quoted from the{' '}
          <a href={ABOUT_URL} className={SOURCE_LINK}>
            About page
          </a>
          , with its dashes replaced by commas. Each length adds to the one before it. Pick the
          shortest one that fits.
        </p>
        <div className="grid gap-4 lg:grid-cols-3">
          {BOILERPLATES.map((boilerplate) => (
            <article key={boilerplate.length} className={CARD}>
              <div className="flex items-baseline justify-between gap-2">
                <h5 className="m-0 text-[length:var(--type-headline-size)] font-semibold text-[var(--label)]">
                  {boilerplate.name}
                </h5>
                <span className="text-[length:var(--type-footnote-size)] tabular-nums text-[var(--label-secondary)]">
                  {wordCount(boilerplate.text)} words
                </span>
              </div>
              <p className="m-0 text-[length:var(--type-callout-size)] leading-[var(--type-callout-line)] text-[var(--label)]">
                {boilerplate.text}
              </p>
              <div className="mt-auto">
                <CopyButton
                  label={`Copy the ${boilerplate.name.toLowerCase()} version`}
                  onCopy={() =>
                    copyLine(boilerplate.text, `the ${boilerplate.name.toLowerCase()} boilerplate`)
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div>
        <h4 className="m-0 mb-1 text-[length:var(--type-title2-size)] font-semibold text-[var(--label)]">
          Approved figures
        </h4>
        <p className="m-0 mb-4 max-w-[68ch] text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
          As of {MESSAGING_AS_OF}, from the{' '}
          <a href={ABOUT_URL} className={SOURCE_LINK}>
            About page
          </a>
          . Always show the as of date with a figure.
        </p>
        <dl className="m-0 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {APPROVED_FIGURES.map((figure) => (
            <div
              key={figure.id}
              className="flex flex-col-reverse gap-1 rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] p-4"
            >
              <dt className="text-[length:var(--type-caption-size)] font-bold uppercase tracking-[0.08em] text-[var(--label-secondary)]">
                {figure.label}
              </dt>
              <dd className="m-0 font-[family-name:var(--type-family-brand)] text-[length:var(--type-large-title-size)] font-medium tabular-nums text-[var(--label)]">
                {figure.value}
              </dd>
            </div>
          ))}
        </dl>
        <Banner tone="info" title="Open question: 77K or 90K jobs" className="mt-4">
          {JOBS_CONFLICT}
        </Banner>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <WordList
          title="Challenge Areas"
          words={CHALLENGE_AREAS}
          note='From the website navigation. Write "and" in running text; "&" only in tight labels, as the home hero does.'
        />
        <WordList
          title="Accelerators"
          words={ACCELERATORS}
          note={`From "Our accelerators" in the website navigation. ${PARTNERSHIP_OFFER} is the partnership offer.`}
        />
        <WordList
          title="Audiences"
          words={AUDIENCES}
          note={`The website's "Our network". In products, keep the words people use there: ${PRODUCT_WORDS.join(', ')}. A mentor or judge is one kind of expert.`}
        />
      </div>

      <Banner tone="warning" title={`"${MISATTRIBUTED_LINE}" is not our line`}>
        {MISATTRIBUTION_NOTE} Use the primary line instead.
      </Banner>
      {toast}
    </div>
  );
};

export default Messaging;
