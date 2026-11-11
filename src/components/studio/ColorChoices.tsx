import { useId } from 'react';
import type { TextColorOption } from '../../studio/guardrails';
import { formatRatio } from '../../studio/guardrails';
import { CheckIcon } from './icons';

interface ColorChoicesProps {
  options: TextColorOption[];
  currentId: string;
  onChoose: (colorId: string) => void;
  showRatio?: boolean;
}

export const ColorChoices = ({
  options,
  currentId,
  onChoose,
  showRatio = true,
}: ColorChoicesProps) => {
  const groupId = useId();
  const sorted = [...options].sort(
    (first, second) => Number(second.allowed) - Number(first.allowed),
  );
  return (
    <ul className="m-0 flex list-none flex-col gap-1 p-0">
      {sorted.map((option) => {
        const isCurrent = option.color.id === currentId;
        const reasonId = `${groupId}-${option.color.id}`;
        return (
          <li key={option.color.id}>
            <button
              type="button"
              aria-pressed={isCurrent}
              aria-disabled={!option.allowed || undefined}
              aria-describedby={option.reason ? reasonId : undefined}
              onClick={() => {
                if (option.allowed) onChoose(option.color.id);
              }}
              className={`flex w-full items-center gap-2 rounded-[var(--corner-md)] border border-solid px-2 py-1.5 text-left text-[length:var(--type-subheadline-size)] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-[var(--focus-color)] ${option.allowed ? 'cursor-pointer text-[var(--label)] hover:bg-[var(--fill-tertiary)]' : 'cursor-not-allowed text-[var(--label-secondary)]'} ${isCurrent ? 'border-[var(--tint)] bg-[var(--tint-fill)] font-semibold' : 'border-transparent bg-transparent'}`}
            >
              <span
                aria-hidden="true"
                className="relative h-5 w-5 shrink-0 rounded-full border border-solid border-[var(--separator-strong)]"
                style={{ background: option.color.hex }}
              >
                {!option.allowed ? (
                  <span className="absolute left-1/2 top-1/2 h-[2px] w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[var(--label-secondary)]" />
                ) : null}
              </span>
              <span className="flex-1">{option.color.name}</span>
              {showRatio ? (
                <span className="tabular-nums text-[length:var(--type-caption-size)]">
                  {option.ratio === null ? 'Measuring' : formatRatio(option.ratio)}
                </span>
              ) : null}
              {isCurrent ? <CheckIcon width={16} height={16} /> : null}
              <span className="sr-only">
                {isCurrent ? ', current' : ''}
                {option.allowed ? '' : ', not available'}
              </span>
            </button>
            {option.reason ? (
              <p
                id={reasonId}
                className="m-0 mb-1 pl-9 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]"
              >
                Not available. {option.reason}
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
};
