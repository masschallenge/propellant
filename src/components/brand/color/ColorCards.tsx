import * as React from 'react';
import { formatRgb, isDark } from '../../../brand/contrast';
import {
  BRAND_COLORS,
  LOGO_COLORS,
  PRINT_NOTES,
  SUPPORTING_COLORS,
  chartColors,
  formatCmyk,
} from '../../../brand/palette';
import type { BrandColor, Cmyk } from '../../../brand/palette';
import { contrastScores } from '../../../brand/pairings';
import { CopyIcon } from '../logo/icons';
import { useCopyToast } from './useCopyToast';

const FAMILY_LABEL: Record<BrandColor['family'], string> = {
  brand: 'Brand',
  accent: 'Accent',
  neutral: 'Neutral',
};

const rgbDigits = (hex: string) => formatRgb(hex).replace(/^rgb\(|\)$/g, '');

const paintText = (hex: string) =>
  isDark(hex) ? 'text-[var(--gray-0)]' : 'text-[var(--gray-800)]';

interface CopyValueProps {
  label: string;
  value: string;
  copied?: string;
  onCopy: (value: string) => void;
}

const CopyValue = ({ label, value, copied = value, onCopy }: CopyValueProps) => (
  <button
    type="button"
    onClick={() => onCopy(copied)}
    aria-label={`Copy ${label} ${value}`}
    className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--corner-md)] border-0 bg-[var(--fill-tertiary)] px-2.5 py-1.5 text-left hover:bg-[var(--fill-secondary)] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-color)]"
  >
    <span className="flex min-w-0 flex-col">
      <span className="text-[length:var(--type-caption-size)] font-semibold uppercase tracking-[0.06em] text-[var(--label-secondary)]">
        {label}
      </span>
      <span className="break-words font-[family-name:var(--type-family-mono)] text-[length:var(--type-subheadline-size)] text-[var(--label)]">
        {value}
      </span>
    </span>
    <CopyIcon className="flex-none text-[var(--label-secondary)] group-hover:text-[var(--tint)]" />
  </button>
);

interface ColorCardProps {
  color: BrandColor;
  onCopy: (value: string) => void;
}

const ColorCard = ({ color, onCopy }: ColorCardProps) => (
  <article className="flex flex-col overflow-hidden rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)]">
    <div
      className={`flex min-h-[104px] flex-col justify-between gap-4 p-3 sm:min-h-[140px] sm:p-4 ${paintText(color.hex)}`}
      style={{ background: color.hex }}
    >
      <p className="m-0 text-[length:var(--type-caption-size)] font-bold uppercase tracking-[0.1em]">
        {FAMILY_LABEL[color.family]}
      </p>
      <h4 className="m-0 text-[length:var(--type-title2-size)] font-semibold">{color.name}</h4>
    </div>
    <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
      <p className="m-0 text-[length:var(--type-subheadline-size)] leading-[var(--type-subheadline-line)] text-[var(--label-secondary)]">
        {color.role}
      </p>
      <div className="flex flex-col gap-1.5">
        <CopyValue label="Hex" value={color.hex} onCopy={onCopy} />
        <CopyValue label="RGB" value={rgbDigits(color.hex)} onCopy={onCopy} />
        <CopyValue label="CMYK" value={formatCmyk(color.cmyk)} onCopy={onCopy} />
        <CopyValue
          label="Token"
          value={color.token}
          copied={`var(${color.token})`}
          onCopy={onCopy}
        />
      </div>
      <dl className="m-0 mt-auto grid grid-cols-2 gap-2 border-t border-solid border-[var(--separator)] pt-3">
        {contrastScores(color.hex).map((score) => (
          <div key={score.against}>
            <dt className="text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
              With {score.against.toLowerCase()}
            </dt>
            <dd className="m-0 flex flex-wrap items-baseline gap-x-1.5 text-[length:var(--type-subheadline-size)] tabular-nums text-[var(--label)]">
              <span className="font-semibold">{score.label}</span>
              <span
                className={
                  score.grade === 'Fail'
                    ? 'text-[var(--critical)]'
                    : 'text-[var(--label-secondary)]'
                }
              >
                {score.grade}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </article>
);

interface SmallHeadingProps {
  title: string;
  badge: string;
  lead: string;
}

const SmallHeading = ({ title, badge, lead }: SmallHeadingProps) => (
  <div className="max-w-[68ch]">
    <h4 className="m-0 flex flex-wrap items-center gap-2 text-[length:var(--type-title3-size)] font-semibold text-[var(--label)]">
      {title}
      <span className="inline-flex min-h-5 items-center rounded-full border border-solid border-[var(--separator-strong)] px-2 text-[length:var(--type-caption-size)] font-semibold text-[var(--label-secondary)]">
        {badge}
      </span>
    </h4>
    <p className="m-0 mt-1 text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
      {lead}
    </p>
  </div>
);

interface SmallColorCardProps {
  name: string;
  hex: string;
  cmyk: Cmyk;
  detail: string;
  tag: string;
  token?: string;
  isDashed?: boolean;
  onCopy: (value: string) => void;
}

const SmallColorCard = ({
  name,
  hex,
  cmyk,
  detail,
  tag,
  token,
  isDashed = false,
  onCopy,
}: SmallColorCardProps) => (
  <article
    className={`flex flex-col overflow-hidden rounded-[var(--corner-xl)] border bg-[var(--bg)] ${isDashed ? 'border-dashed border-[var(--separator-strong)]' : 'border-solid border-[var(--separator)]'}`}
  >
    <div
      className={`flex min-h-[88px] flex-col justify-between gap-3 p-4 ${paintText(hex)}`}
      style={{ background: hex }}
    >
      <p className="m-0 text-[length:var(--type-caption-size)] font-bold uppercase tracking-[0.1em]">
        {tag}
      </p>
      <h5 className="m-0 text-[length:var(--type-title3-size)] font-semibold">{name}</h5>
    </div>
    <div className="flex flex-col gap-1.5 p-4">
      <p className="m-0 mb-1 text-[length:var(--type-subheadline-size)] text-[var(--label-secondary)]">
        {detail}
      </p>
      <CopyValue label="Hex" value={hex} onCopy={onCopy} />
      <CopyValue label="RGB" value={rgbDigits(hex)} onCopy={onCopy} />
      <CopyValue label="CMYK" value={formatCmyk(cmyk)} onCopy={onCopy} />
      {token ? (
        <CopyValue label="Token" value={token} copied={`var(${token})`} onCopy={onCopy} />
      ) : null}
    </div>
  </article>
);

const ColorCards = () => {
  const { copy, toast } = useCopyToast();
  const handleCopy = (value: string) => {
    void copy(value);
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {BRAND_COLORS.map((color) => (
          <ColorCard key={color.id} color={color} onCopy={handleCopy} />
        ))}
      </div>

      <p className="m-0 mt-4 max-w-[68ch] text-[length:var(--type-callout-size)] leading-[var(--type-callout-line)] text-[var(--label-secondary)]">
        {PRINT_NOTES.cmyk} {PRINT_NOTES.pantone}
      </p>

      <div className="mt-10 flex flex-col gap-4">
        <SmallHeading
          title="Supporting neutrals"
          badge="Lines and charts"
          lead={`Two grays from the Propellant tokens for rules, table lines and charts. Chart colors always go in this order, with direct labels: ${chartColors()
            .map((color) => color.name)
            .join(', ')}.`}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {SUPPORTING_COLORS.map((color) => (
            <SmallColorCard
              key={color.id}
              name={color.name}
              hex={color.hex}
              cmyk={color.cmyk}
              detail={color.role}
              tag="Supporting"
              token={color.token}
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4">
        <SmallHeading
          title="Logo colors"
          badge="Logo only"
          lead="These are the colors of the logo files. They belong to the logo only; interface colors come from the palette above."
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {LOGO_COLORS.map((color) => (
            <SmallColorCard
              key={color.name}
              name={color.name}
              hex={color.hex}
              cmyk={color.cmyk}
              detail={color.part}
              tag="Logo only"
              isDashed
              onCopy={handleCopy}
            />
          ))}
        </div>
      </div>
      {toast}
    </>
  );
};

export default ColorCards;
