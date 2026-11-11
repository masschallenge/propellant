import * as React from 'react';
import {
  Button,
  PopUpButton,
  SegmentedControl,
  Switch,
  Textarea,
} from '@masschallenge/propellant-web';
import { TEXT_STYLES, textStyleTokens } from '../../../brand/design-tokens';
import { PRIMARY_LINE } from '../../../brand/messaging';
import type { TokenMap } from '../../../brand/design-tokens';
import { CopyIcon } from '../logo/icons';
import { useCopyToast } from '../color/useCopyToast';

type FontId = 'sans' | 'oswald';

interface TypeTesterProps {
  tokens: TokenMap;
  shrinkingStyles: string[];
}

const FONT_FAMILY: Record<FontId, { name: string; token: string }> = {
  sans: { name: 'Propellant Sans', token: '--type-family' },
  oswald: { name: 'Oswald', token: '--type-family-brand' },
};

const TypeTester = ({ tokens, shrinkingStyles }: TypeTesterProps) => {
  const { copy, toast } = useCopyToast();
  const [words, setWords] = React.useState(PRIMARY_LINE);
  const [styleId, setStyleId] = React.useState('title1');
  const [fontId, setFontId] = React.useState<FontId>('sans');
  const [isDarkPreview, setIsDarkPreview] = React.useState(false);
  const styleTokens = textStyleTokens(tokens, styleId);
  const style = TEXT_STYLES.find((candidate) => candidate.id === styleId) ?? TEXT_STYLES[0];
  const family = FONT_FAMILY[fontId];
  const isOswald = fontId === 'oswald';

  const rows = [
    { property: 'font-family', token: { name: family.token, value: tokens[family.token] ?? '' } },
    { property: 'font-size', token: styleTokens.size },
    { property: 'line-height', token: styleTokens.line },
    { property: 'font-weight', token: styleTokens.weight },
    { property: 'letter-spacing', token: styleTokens.tracking },
  ].filter((row) => row.token.value !== '');

  const cssText = [
    ...rows.map((row) => `${row.property}: var(${row.token.name});`),
    ...(isOswald ? ['text-transform: uppercase;'] : []),
  ].join('\n');

  return (
    <div className="grid gap-6 rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-5 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="flex flex-col gap-5">
        <Textarea
          label="Your words"
          value={words}
          rows={3}
          onChange={(event) => setWords(event.target.value)}
        />
        <PopUpButton
          label="Text style"
          options={TEXT_STYLES.map((option) => ({
            value: option.id,
            label: option.name,
            sub: tokens[`--type-${option.id}-size`],
          }))}
          value={styleId}
          onChange={setStyleId}
        />
        <div className="flex flex-col gap-2">
          <span className="text-[length:var(--type-subheadline-size)] font-medium text-[var(--label)]">
            Font
          </span>
          <SegmentedControl
            aria-label="Font"
            items={[
              { id: 'sans', label: 'Propellant Sans' },
              { id: 'oswald', label: 'Oswald' },
            ]}
            value={fontId}
            onChange={(nextId) => setFontId(nextId as FontId)}
            className="self-start"
          />
        </div>
        <Switch
          label="Dark preview"
          hint="Shows the words with the dark theme tokens."
          checked={isDarkPreview}
          onChange={setIsDarkPreview}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <div
          data-theme={isDarkPreview ? 'dark' : undefined}
          className="flex min-h-[220px] items-center overflow-hidden rounded-[var(--corner-lg)] border border-solid border-[var(--separator)] bg-[var(--bg)] p-6 text-[var(--label)]"
        >
          <p
            className="m-0 max-w-[var(--type-measure)] break-words"
            style={{
              fontFamily: `var(${family.token})`,
              fontSize: `var(${styleTokens.size.name})`,
              lineHeight: `var(${styleTokens.line.name})`,
              fontWeight: `var(${styleTokens.weight.name})`,
              letterSpacing: styleTokens.tracking.value
                ? `var(${styleTokens.tracking.name})`
                : undefined,
              textTransform: isOswald ? 'uppercase' : undefined,
            }}
          >
            {words || 'Type something to try it.'}
          </p>
        </div>

        <p
          className="m-0 text-[length:var(--type-callout-size)] text-[var(--label-secondary)]"
          aria-live="polite"
        >
          {isOswald
            ? 'Oswald is always set in capitals, so the preview turns your words into capitals. Use it only for display headlines on public pages, never inside signed in applications.'
            : `${style.name} in Propellant Sans, the font for all interface and body text.`}
          {shrinkingStyles.includes(styleId)
            ? ` ${style.name} gets smaller on screens under 640px wide.`
            : ''}
        </p>

        <div className="overflow-hidden rounded-[var(--corner-lg)] border border-solid border-[var(--separator)]">
          <table className="w-full border-collapse text-left text-[length:var(--type-subheadline-size)]">
            <caption className="sr-only">Tokens for {style.name}</caption>
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--label-secondary)]">
                <th scope="col" className="px-3 py-2 font-semibold">
                  Token
                </th>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.property} className="border-t border-solid border-[var(--separator)]">
                  <td className="whitespace-nowrap px-3 py-2 font-[family-name:var(--type-family-mono)] text-[var(--label)]">
                    {row.token.name}
                  </td>
                  <td className="px-3 py-2 font-[family-name:var(--type-family-mono)] text-[var(--label-secondary)] [overflow-wrap:anywhere]">
                    {row.token.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2">
          <pre className="m-0 overflow-x-auto rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] p-3 font-[family-name:var(--type-family-mono)] text-[length:var(--type-footnote-size)] text-[var(--label)]">
            <code>{cssText}</code>
          </pre>
          <Button
            variant="gray"
            size="sm"
            iconLeading={<CopyIcon />}
            className="self-start"
            onClick={() => void copy(cssText, `the CSS for ${style.name}`)}
          >
            Copy CSS
          </Button>
        </div>
      </div>
      {toast}
    </div>
  );
};

export default TypeTester;
