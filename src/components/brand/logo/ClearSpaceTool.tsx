import * as React from 'react';
import { AlertCircleIcon, SegmentedControl, Slider } from '@masschallenge/propellant-web';
import {
  clearSpaceFor,
  findLockup,
  isBelowMinimum,
  logoWidthFor,
  minimumLabel,
} from '../../../brand/logo-usage';
import type { LogoLockupId } from '../../../brand/logo-usage';
import { CheckIcon } from './icons';
import { LOGO_FILES } from './logoFiles';

const MINIMUM_SLIDER = 8;
const MAXIMUM_SLIDER = 64;

const HATCH = 'repeating-linear-gradient(45deg, var(--tint-fill-hover) 0 2px, transparent 2px 7px)';

const formatPixels = (value: number) => `${Number.isInteger(value) ? value : value.toFixed(1)}px`;

const ClearSpaceTool = () => {
  const [lockupId, setLockupId] = React.useState<LogoLockupId>('horizontal');
  const [logoHeight, setLogoHeight] = React.useState(32);
  const lockup = findLockup(lockupId);
  const clearSpace = clearSpaceFor(lockupId, logoHeight);
  const logoWidth = logoWidthFor(lockupId, logoHeight);
  const isTooSmall = isBelowMinimum(lockupId, logoHeight);

  return (
    <div className="flex flex-col gap-6 rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
        <SegmentedControl
          aria-label="Logo"
          items={[
            { id: 'horizontal', label: 'Horizontal' },
            { id: 'monogram', label: 'MC mark' },
          ]}
          value={lockupId}
          onChange={(nextId) => setLockupId(nextId as LogoLockupId)}
        />
        <div className="flex-1 sm:max-w-[360px]">
          <Slider
            label={`Logo height: ${logoHeight}px`}
            aria-label="Logo height in pixels"
            min={MINIMUM_SLIDER}
            max={MAXIMUM_SLIDER}
            value={logoHeight}
            onChange={setLogoHeight}
            format={(value) => `${value}px`}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] p-3 sm:p-6">
        <div className="flex min-h-[200px] items-center justify-center">
          <div
            className="relative inline-block bg-[var(--gray-0)]"
            style={{ padding: clearSpace, backgroundImage: HATCH }}
          >
            <div className="relative outline-1 outline-dashed outline-[var(--tint)]">
              <img
                src={LOGO_FILES[lockupId].color}
                alt={`MassChallenge ${lockup.name} logo at ${logoHeight}px tall`}
                style={{ height: logoHeight }}
                className="block w-auto max-w-none bg-[var(--gray-0)]"
                draggable={false}
              />
            </div>
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-0 -translate-x-1/2 whitespace-nowrap px-1 text-[length:var(--type-caption-size)] font-semibold tabular-nums text-[var(--teal-800)]"
              style={{ lineHeight: `${Math.max(clearSpace, 4)}px` }}
            >
              {clearSpace >= 10 ? formatPixels(clearSpace) : null}
            </span>
          </div>
        </div>
      </div>

      <dl className="m-0 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            Logo size
          </dt>
          <dd className="m-0 text-[length:var(--type-title2-size)] font-semibold tabular-nums text-[var(--label)]">
            {formatPixels(logoWidth)} by {logoHeight}px
          </dd>
        </div>
        <div>
          <dt className="text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            Clear space on every side
          </dt>
          <dd className="m-0 text-[length:var(--type-title2-size)] font-semibold tabular-nums text-[var(--label)]">
            {formatPixels(clearSpace)}
          </dd>
        </div>
        <div>
          <dt className="text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            Smallest on screen
          </dt>
          <dd className="m-0 text-[length:var(--type-title2-size)] font-semibold tabular-nums text-[var(--label)]">
            {minimumLabel(lockup)}
          </dd>
        </div>
      </dl>

      <div aria-live="polite" aria-atomic="true">
        {isTooSmall ? (
          <p className="m-0 flex items-start gap-2 rounded-[var(--corner-lg)] bg-[var(--warning-fill)] p-3 text-[length:var(--type-callout-size)] text-[var(--label)]">
            <AlertCircleIcon className="h-5 w-5 flex-none text-[var(--warning)]" />
            <span>
              <strong className="font-semibold">Too small.</strong> {lockup.name}: at least{' '}
              {minimumLabel(lockup)} on screen. {lockup.minimumNote}
            </span>
          </p>
        ) : (
          <p className="m-0 flex items-start gap-2 p-3 text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
            <CheckIcon className="mt-0.5 h-4 w-4 flex-none text-[var(--success)]" />
            <span>
              Big enough. Keep {formatPixels(clearSpace)} clear of type, images, edges and other
              logos on every side.
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ClearSpaceTool;
