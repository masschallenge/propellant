import * as React from 'react';
import { Button } from '@masschallenge/propellant-web';
import { MOTION_DEMOS } from '../../../brand/design-tokens';
import type { MotionDemo, TokenMap } from '../../../brand/design-tokens';
import { PlayIcon } from '../logo/icons';

const SLOWED_DURATION = '1200ms';

interface MotionDemosProps {
  tokens: TokenMap;
  reducedTokens: TokenMap;
}

const usePrefersReducedMotion = () => {
  const [isReduced, setIsReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setIsReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return isReduced;
};

const transitionFor = (demo: MotionDemo, isReduced: boolean) => {
  if (demo.kind === 'easing') {
    return isReduced ? 'none' : `transform ${SLOWED_DURATION} var(${demo.token})`;
  }
  if (demo.kind === 'spring') {
    return `transform var(${demo.durationToken}) var(${demo.token})`;
  }
  return `opacity var(${demo.token}) var(--ease-standard), transform var(${demo.token}) var(--ease-standard)`;
};

interface DemoCardProps {
  demo: MotionDemo;
  tokens: TokenMap;
  reducedTokens: TokenMap;
  isReduced: boolean;
}

const DemoCard = ({ demo, tokens, reducedTokens, isReduced }: DemoCardProps) => {
  const [isAtEnd, setIsAtEnd] = React.useState(false);
  const isDuration = demo.kind === 'duration';
  const durationValue = demo.durationToken ? tokens[demo.durationToken] : null;
  const reducedValue = demo.durationToken ? reducedTokens[demo.durationToken] : undefined;

  const movingStyle: React.CSSProperties = isDuration
    ? { opacity: isAtEnd ? 0 : 1, transform: isAtEnd ? 'scale(0.9)' : 'scale(1)' }
    : { transform: isAtEnd ? 'translateX(calc(100cqw - 100%))' : 'translateX(0)' };

  return (
    <article className="flex flex-col gap-4 rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="m-0 text-[length:var(--type-title3-size)] font-semibold text-[var(--label)]">
            {demo.name}
          </h4>
          <p className="m-0 mt-1 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            {demo.usedBy.length
              ? `Used by ${demo.usedBy.join(', ')}`
              : 'Not used by a Propellant component yet'}
          </p>
        </div>
        <Button
          variant="tinted"
          size="sm"
          iconLeading={<PlayIcon />}
          aria-label={`Play ${demo.name.toLowerCase()}`}
          onClick={() => setIsAtEnd((previous) => !previous)}
        >
          Play
        </Button>
      </header>

      <div className="rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] p-3 [container-type:inline-size]">
        <div
          aria-hidden="true"
          className={`h-10 rounded-[var(--corner-md)] bg-[var(--tint)] ${isDuration ? 'w-full' : 'w-10'}`}
          style={{ ...movingStyle, transition: transitionFor(demo, isReduced) }}
        />
      </div>

      <dl className="m-0 flex flex-col gap-1.5 font-[family-name:var(--type-family-mono)] text-[length:var(--type-footnote-size)]">
        <div className="flex flex-col">
          <dt className="text-[var(--label)]">{demo.token}</dt>
          <dd className="m-0 break-words text-[var(--label-secondary)]">{tokens[demo.token]}</dd>
        </div>
        {demo.durationToken && demo.durationToken !== demo.token ? (
          <div className="flex flex-col">
            <dt className="text-[var(--label)]">{demo.durationToken}</dt>
            <dd className="m-0 text-[var(--label-secondary)]">{durationValue}</dd>
          </div>
        ) : null}
      </dl>
      <p className="m-0 mt-auto text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
        {demo.kind === 'easing'
          ? `Slowed to ${SLOWED_DURATION} here so you can see the curve.`
          : reducedValue
            ? `With reduced motion: ${reducedValue}.`
            : 'Unchanged with reduced motion.'}
      </p>
    </article>
  );
};

const MotionDemos = ({ tokens, reducedTokens }: MotionDemosProps) => {
  const isReduced = usePrefersReducedMotion();
  return (
    <div className="flex flex-col gap-4">
      <p
        className="m-0 rounded-[var(--corner-lg)] bg-[var(--tint-fill)] p-3 text-[length:var(--type-callout-size)] text-[var(--label)]"
        aria-live="polite"
      >
        {isReduced
          ? 'Your device asks for reduced motion, so these demos jump straight to the end, just as Propellant does.'
          : 'Your device allows motion. Turn on reduced motion in your system settings and these demos jump straight to the end.'}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {MOTION_DEMOS.map((demo) => (
          <DemoCard
            key={demo.id}
            demo={demo}
            tokens={tokens}
            reducedTokens={reducedTokens}
            isReduced={isReduced}
          />
        ))}
      </div>
    </div>
  );
};

export default MotionDemos;
