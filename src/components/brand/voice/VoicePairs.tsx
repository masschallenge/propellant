import * as React from 'react';

interface VoicePair {
  avoid: string;
  write: string;
}

interface VoicePairsProps {
  pairs: VoicePair[];
}

const FlipCard = ({ pair, index }: { pair: VoicePair; index: number }) => {
  const [isFlipped, setIsFlipped] = React.useState(false);
  return (
    <button
      type="button"
      aria-pressed={isFlipped}
      aria-label={`Example ${index + 1}. ${isFlipped ? `Write: ${pair.write}` : `Don't write: ${pair.avoid}`}. Press to flip.`}
      onClick={() => setIsFlipped((previous) => !previous)}
      className="group relative min-h-[180px] sm:min-h-[220px] w-full cursor-pointer border-0 bg-transparent p-0 text-left [perspective:1200px] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-color)] rounded-[var(--corner-xl)]"
    >
      <span
        className={`relative block h-full min-h-[180px] sm:min-h-[220px] transition-transform duration-[var(--spring-smooth-duration)] ease-[var(--spring-smooth)] [transform-style:preserve-3d] motion-reduce:transition-none ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 flex flex-col gap-3 rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-5 [backface-visibility:hidden]"
        >
          <span className="flex items-center gap-1.5 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--critical)]">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Don't write
          </span>
          <span className="text-[length:var(--type-title3-size)] leading-[var(--type-title3-line)] text-[var(--label)] line-through decoration-[var(--critical)] decoration-1">
            {pair.avoid}
          </span>
          <span className="mt-auto text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            Flip for what to write
          </span>
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 flex flex-col gap-3 rounded-[var(--corner-xl)] bg-[var(--teal-900)] p-5 text-[var(--gray-0)] [backface-visibility:hidden] [transform:rotateY(180deg)]"
        >
          <span className="flex items-center gap-1.5 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--teal-300)]">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            Write
          </span>
          <span className="text-[length:var(--type-title3-size)] leading-[var(--type-title3-line)] font-semibold">
            {pair.write}
          </span>
          <span className="mt-auto text-[length:var(--type-footnote-size)] text-[var(--teal-100)]">
            Flip back
          </span>
        </span>
      </span>
    </button>
  );
};

const VoicePairs = ({ pairs }: VoicePairsProps) => (
  <div className="grid gap-4 md:grid-cols-3">
    {pairs.map((pair, index) => (
      <FlipCard key={pair.avoid} pair={pair} index={index} />
    ))}
  </div>
);

export default VoicePairs;
