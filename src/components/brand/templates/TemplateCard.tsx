import { Badge, Button } from '@masschallenge/propellant-web';

export interface TemplateDownload {
  label: string;
  app: string;
  href: string;
  extension: string;
}

interface TemplateCardProps {
  name: string;
  app: string;
  guide: string;
  previewUrl: string | null;
  isWide: boolean;
  downloads: TemplateDownload[];
}

const TemplateCard = ({ name, app, guide, previewUrl, isWide, downloads }: TemplateCardProps) => (
  <article className="flex h-full flex-col overflow-hidden rounded-[var(--corner-xl)] border border-solid border-[var(--separator)] bg-[var(--bg)]">
    <div className="relative flex aspect-[4/3] items-center justify-center bg-[var(--bg-secondary)] p-6">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={`The first ${isWide ? 'slide' : 'page'} of the ${name.toLowerCase()} template`}
          loading="lazy"
          className="absolute inset-6 block h-[calc(100%-3rem)] w-[calc(100%-3rem)] object-contain [filter:drop-shadow(0_4px_12px_rgb(0_0_0/0.18))]"
        />
      ) : (
        <p className="m-0 max-w-[24ch] text-center text-footnote text-[var(--label-secondary)]">
          No preview yet. It appears after the next sync with LibreOffice installed.
        </p>
      )}
    </div>
    <div className="flex flex-1 flex-col gap-3 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="m-0 text-headline text-[var(--label)]">{name}</h3>
        <Badge size="sm" tone="info">
          {app}
        </Badge>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {downloads.map((download) => (
          <li key={download.href} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-subheadline text-[var(--label-secondary)]">{download.app}</span>
            <Button
              size="sm"
              variant="tinted"
              href={download.href}
              download
              aria-label={`Download the ${download.label}, .${download.extension}`}
            >
              Download .{download.extension}
            </Button>
          </li>
        ))}
      </ul>
      <a href={guide} className="mt-auto text-subheadline text-[var(--tint)]">
        How to use it in {app}
      </a>
    </div>
  </article>
);

export default TemplateCard;
