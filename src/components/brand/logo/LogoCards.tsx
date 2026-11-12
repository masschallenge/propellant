import * as React from 'react';
import { Badge, Button } from '@masschallenge/propellant-web';
import { isDark } from '../../../brand/contrast';
import {
  LOGO_BACKGROUNDS,
  LOGO_LOCKUPS,
  LOGO_TREATMENTS,
  findBackground,
  findTreatment,
  logoFileName,
  suitsBackground,
  treatmentFor,
} from '../../../brand/logo-usage';
import type { LogoBackground, LogoLockup, LogoTreatmentId } from '../../../brand/logo-usage';
import { CheckIcon, DownloadIcon } from './icons';
import { LOGO_FILES } from './logoFiles';

export const PHOTO_STAND_IN =
  'radial-gradient(circle at 75% 25%, rgb(255 255 255 / 0.14), transparent 45%), linear-gradient(135deg, var(--gray-950) 0%, var(--teal-950) 50%, var(--gray-650) 100%)';

export const backgroundStyle = (background: LogoBackground): React.CSSProperties =>
  background.hex ? { background: background.hex } : { background: PHOTO_STAND_IN };

const isDarkSwatch = (background: LogoBackground) =>
  background.isPhoto || (background.hex !== null && isDark(background.hex));

const FOCUS_RING =
  'peer-focus-visible:outline-[length:var(--focus-width)] peer-focus-visible:outline-solid peer-focus-visible:outline-offset-[var(--focus-offset)] peer-focus-visible:outline-[var(--focus-color)]';

const PREVIEW_HEIGHT: Record<LogoLockup['id'], string> = {
  horizontal: 'h-10 sm:h-14',
  monogram: 'h-16 sm:h-20',
};

interface LogoCardProps {
  lockup: LogoLockup;
}

const LogoCard = ({ lockup }: LogoCardProps) => {
  const groupName = React.useId();
  const [backgroundId, setBackgroundId] = React.useState('white');
  const background = findBackground(backgroundId);
  const [treatmentId, setTreatmentId] = React.useState<LogoTreatmentId>(treatmentFor(background));
  const treatment = findTreatment(treatmentId);
  const recommended = findTreatment(treatmentFor(background));
  const isSuitable = suitsBackground(treatmentId, background);
  const fileName = logoFileName(lockup.id, treatmentId);

  const handleBackgroundChange = (nextId: string) => {
    setBackgroundId(nextId);
    setTreatmentId(treatmentFor(findBackground(nextId)));
  };

  return (
    <article className="flex flex-col overflow-hidden rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)]">
      <div
        className="flex aspect-[16/9] items-center justify-center p-8 transition-[background] duration-[var(--duration-fade)] ease-[var(--ease-standard)]"
        style={backgroundStyle(background)}
      >
        <img
          src={LOGO_FILES[lockup.id][treatmentId]}
          alt={`MassChallenge ${lockup.name} logo, ${treatment.name.toLowerCase()}, on ${background.name}`}
          className={`${PREVIEW_HEIGHT[lockup.id]} w-auto max-w-full object-contain`}
          draggable={false}
        />
      </div>
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-[length:var(--type-title2-size)] font-semibold text-[var(--label)]">
              {lockup.name}
            </h3>
            <Badge tone="info" emphasis="strong" size="sm">
              {lockup.badge}
            </Badge>
          </div>
          <p className="m-0 text-[length:var(--type-body-size)] leading-[var(--type-body-line)] text-[var(--label-secondary)]">
            {lockup.use}
          </p>
        </div>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 p-0 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--label-secondary)]">
            What is it going on?
          </legend>
          <div className="flex flex-wrap gap-2">
            {LOGO_BACKGROUNDS.map((option) => {
              const isSelected = option.id === backgroundId;
              return (
                <label key={option.id} className="relative cursor-pointer" title={option.name}>
                  <input
                    type="radio"
                    name={`${groupName}-background`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => handleBackgroundChange(option.id)}
                    className="peer sr-only"
                  />
                  <span className="sr-only">{option.name}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-full border border-solid border-[var(--separator-strong)] ${FOCUS_RING} ${isSelected ? 'ring-2 ring-[var(--tint)] ring-offset-2 ring-offset-[var(--bg)]' : ''}`}
                    style={backgroundStyle(option)}
                  >
                    {isSelected ? (
                      <CheckIcon
                        className={
                          isDarkSwatch(option) ? 'text-[var(--gray-0)]' : 'text-[var(--gray-800)]'
                        }
                      />
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="m-0 mt-2 text-[length:var(--type-subheadline-size)] text-[var(--label-secondary)]">
            On{' '}
            <strong className="font-semibold text-[var(--label)]">
              {background.isPhoto ? 'a dark photo' : background.name}
            </strong>
            {background.isPhoto ? ' (shown as a stand in, not a real photo)' : null}, use{' '}
            <strong className="font-semibold text-[var(--label)]">{recommended.name}</strong>.
          </p>
        </fieldset>

        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 p-0 text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--label-secondary)]">
            Colorway
          </legend>
          <div className="flex flex-wrap gap-2">
            {LOGO_TREATMENTS.map((option) => {
              const isSelected = option.id === treatmentId;
              return (
                <label key={option.id} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name={`${groupName}-treatment`}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => setTreatmentId(option.id)}
                    className="peer sr-only"
                  />
                  <span
                    className={`inline-flex min-h-[var(--control-md)] items-center gap-1.5 rounded-full border border-solid px-3 text-[length:var(--type-callout-size)] ${FOCUS_RING} ${
                      isSelected
                        ? 'border-[var(--tint)] bg-[var(--tint-fill)] font-semibold text-[var(--label)]'
                        : 'border-[var(--separator-strong)] font-medium text-[var(--label-secondary)] hover:bg-[var(--fill-tertiary)]'
                    }`}
                  >
                    {isSelected ? <CheckIcon /> : null}
                    {option.name}
                  </span>
                </label>
              );
            })}
          </div>
          <p
            className="m-0 mt-2 min-h-[1.25rem] text-[length:var(--type-subheadline-size)] text-[var(--label-secondary)]"
            aria-live="polite"
          >
            {isSuitable
              ? treatment.useOn
              : `${treatment.name} is not for ${background.isPhoto ? 'a photo' : background.name}. Use ${recommended.name.toLowerCase()} here.`}
          </p>
        </fieldset>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            href={LOGO_FILES[lockup.id][treatmentId]}
            download={fileName}
            variant="filled"
            iconLeading={<DownloadIcon />}
            className="self-start"
          >
            Download PNG
          </Button>
          <p className="m-0 break-all font-[family-name:var(--type-family-mono)] text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
            {fileName}
          </p>
        </div>
      </div>
    </article>
  );
};

const LogoCards = () => (
  <div className="grid gap-6 md:grid-cols-2">
    {LOGO_LOCKUPS.map((lockup) => (
      <LogoCard key={lockup.id} lockup={lockup} />
    ))}
  </div>
);

export default LogoCards;
