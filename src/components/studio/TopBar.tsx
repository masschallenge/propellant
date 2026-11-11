import { Button, IconButton, Menu, PopUpButton } from '@masschallenge/propellant-web';
import { POST_FORMATS, formatSizeLabel } from '../../studio/formats';
import type { BrandIssue } from '../../studio/guardrails';
import { AlertIcon, CheckIcon, DownloadIcon, RedoIcon, SparkIcon, UndoIcon } from './icons';

interface TopBarProps {
  formatId: string;
  issues: BrandIssue[];
  canUndo: boolean;
  canRedo: boolean;
  isDownloading: boolean;
  onOpenBrief: () => void;
  onFormat: (formatId: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onIssue: (issue: BrandIssue) => void;
  onDownload: () => void;
}

const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export const TopBar = ({
  formatId,
  issues,
  canUndo,
  canRedo,
  isDownloading,
  onOpenBrief,
  onFormat,
  onUndo,
  onRedo,
  onIssue,
  onDownload,
}: TopBarProps) => {
  const modifier = isMac() ? 'Command' : 'Control';
  const issueCount = issues.length;
  return (
    <div
      role="toolbar"
      aria-label="Studio"
      className="flex flex-wrap items-center gap-2 border-b border-solid border-[var(--separator)] bg-[var(--bg)] px-4 py-2"
    >
      <Button variant="tinted" size="sm" iconLeading={<SparkIcon />} onClick={onOpenBrief}>
        I need a post about...
      </Button>
      <PopUpButton
        ariaLabel="Format"
        size="sm"
        value={formatId}
        onChange={onFormat}
        options={POST_FORMATS.map((format) => ({
          value: format.id,
          label: format.name,
          sub: formatSizeLabel(format),
        }))}
        className="min-w-[13rem]"
      />
      <div className="flex items-center gap-1">
        <IconButton
          aria-label="Undo"
          aria-keyshortcuts="Control+Z Meta+Z"
          title={`Undo (${modifier} Z)`}
          variant="gray"
          size="sm"
          disabled={!canUndo}
          onClick={onUndo}
        >
          <UndoIcon />
        </IconButton>
        <IconButton
          aria-label="Redo"
          aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
          title={`Redo (${modifier} Shift Z)`}
          variant="gray"
          size="sm"
          disabled={!canRedo}
          onClick={onRedo}
        >
          <RedoIcon />
        </IconButton>
      </div>
      <div className="ml-auto flex items-center gap-2">
        {issueCount ? (
          <Menu
            align="end"
            trigger={
              <Button
                size="sm"
                variant="gray"
                iconLeading={<AlertIcon className="text-[var(--warning)]" />}
                data-brand-status="off"
              >
                {issueCount === 1 ? '1 thing is off brand' : `${issueCount} things are off brand`}
              </Button>
            }
            items={[
              { section: 'Select one to fix it' },
              ...issues.map((issue) => ({
                label: issue.message,
                onSelect: () => onIssue(issue),
              })),
            ]}
          />
        ) : (
          <span
            data-brand-status="on"
            className="inline-flex min-h-[var(--control-sm)] items-center gap-1.5 rounded-[var(--corner-capsule)] bg-[var(--tint-fill)] px-3 text-[length:var(--type-subheadline-size)] font-semibold text-[var(--tint)]"
          >
            <CheckIcon width={16} height={16} />
            On brand
          </span>
        )}
        <span className="sr-only" aria-live="polite">
          {issueCount ? `${issueCount} off brand` : 'On brand'}
        </span>
        <Button
          variant="filled"
          size="sm"
          iconLeading={<DownloadIcon />}
          loading={isDownloading}
          onClick={onDownload}
        >
          Download PNG
        </Button>
      </div>
    </div>
  );
};
