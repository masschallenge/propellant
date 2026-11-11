import {
  Button,
  FileUploader,
  PopUpButton,
  Sheet,
  TextField,
  Textarea,
} from '@masschallenge/propellant-web';
import { useEffect, useRef } from 'react';
import { POST_FORMATS, formatSizeLabel } from '../../studio/formats';
import type { LayoutOption } from '../../studio/layouts';
import type { RenderAssets } from '../../studio/render';
import type { MeasureText } from '../../studio/text';
import { SceneThumbnail } from './SceneThumbnail';
import type { PhotoAsset } from './useStudioAssets';

export interface BriefDraft {
  formatId: string;
  smallLine: string;
  bigLine: string;
  details: string;
  callToAction: string;
  photoId: string | null;
}

interface BriefDialogProps {
  open: boolean;
  draft: BriefDraft;
  photo: PhotoAsset | null;
  layouts: LayoutOption[];
  isBigLineMissing: boolean;
  photoError: string | null;
  assets: RenderAssets;
  measure: MeasureText;
  onDraft: (patch: Partial<BriefDraft>) => void;
  onPhotoFile: (file: File) => void;
  onLayOut: () => void;
  onShuffle: () => void;
  onPick: (layout: LayoutOption) => void;
  onStartBlank: () => void;
  onClose: () => void;
}

export const BriefDialog = ({
  open,
  draft,
  photo,
  layouts,
  isBigLineMissing,
  photoError,
  assets,
  measure,
  onDraft,
  onPhotoFile,
  onLayOut,
  onShuffle,
  onPick,
  onStartBlank,
  onClose,
}: BriefDialogProps) => {
  const layoutsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (layouts.length) layoutsRef.current?.scrollIntoView({ block: 'nearest' });
  }, [layouts]);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      hideIcon
      size="xl"
      title="What is the post about?"
      description="Give it the words and it lays them out a few different ways using only the MassChallenge brand: its fonts, its colors and its logos. It arranges what you write; it does not write for you. Pick one and fine tune it."
      footer={
        <>
          <Button variant="plain" onClick={onClose}>
            Close
          </Button>
          <Button variant="gray" onClick={onStartBlank}>
            Start blank instead
          </Button>
          <Button variant="gray" onClick={onShuffle}>
            Shuffle the colors
          </Button>
          <Button variant="filled" onClick={onLayOut}>
            Lay it out
          </Button>
        </>
      }
    >
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <form
          className="flex flex-col gap-4"
          aria-label="The words for the post"
          onSubmit={(event) => {
            event.preventDefault();
            onLayOut();
          }}
        >
          <PopUpButton
            label="Format"
            value={draft.formatId}
            onChange={(formatId) => onDraft({ formatId })}
            options={POST_FORMATS.map((format) => ({
              value: format.id,
              label: format.name,
              sub: formatSizeLabel(format),
            }))}
          />
          <TextField
            label="Small line on top"
            hint="Optional"
            value={draft.smallLine}
            onChange={(event) => onDraft({ smallLine: event.target.value })}
          />
          <TextField
            label="The big line"
            required
            invalid={isBigLineMissing}
            hint={isBigLineMissing ? 'Add the big line first.' : 'Set in Oswald capitals.'}
            value={draft.bigLine}
            onChange={(event) => onDraft({ bigLine: event.target.value })}
          />
          <Textarea
            label="Details"
            hint="Optional"
            rows={3}
            value={draft.details}
            onChange={(event) => onDraft({ details: event.target.value })}
          />
          <TextField
            label="Call to action or handle"
            hint="Optional"
            value={draft.callToAction}
            onChange={(event) => onDraft({ callToAction: event.target.value })}
          />
          <div className="flex flex-col gap-2">
            <span className="text-[length:var(--type-subheadline-size)] font-semibold text-[var(--label)]">
              Your photo (optional)
            </span>
            {photo ? (
              <div className="flex items-center gap-3">
                <img
                  src={photo.url}
                  alt=""
                  className="h-14 w-14 rounded-[var(--corner-sm)] object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-[length:var(--type-subheadline-size)]">
                  {photo.name}
                </span>
                <Button size="sm" variant="plain" onClick={() => onDraft({ photoId: null })}>
                  Remove photo
                </Button>
              </div>
            ) : (
              <FileUploader
                label="Drop your photo here, or"
                ctaLabel="choose one"
                accept="image/*"
                error={Boolean(photoError)}
                hint={photoError ?? 'JPG or PNG.'}
                onFiles={(files) => {
                  const file = files[0];
                  if (file) onPhotoFile(file);
                }}
              />
            )}
            <p className="m-0 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
              Your photo stays in this browser. It is never uploaded.
            </p>
          </div>
          <button type="submit" hidden tabIndex={-1} aria-hidden="true" />
        </form>
        <section ref={layoutsRef} aria-label="Layouts" className="flex min-w-0 flex-col gap-3">
          {layouts.length ? (
            <>
              <p className="m-0 text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
                {layouts.length} layouts of the same words. Pick one to open it in the editor.
              </p>
              <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 lg:grid-cols-3">
                {layouts.map((layout, index) => (
                  <li key={layout.id}>
                    <button
                      type="button"
                      data-layout={layout.id}
                      onClick={() => onPick(layout)}
                      aria-label={`Use layout ${index + 1} of ${layouts.length}: ${layout.name}`}
                      className="flex w-full cursor-pointer flex-col items-start gap-2 rounded-[var(--corner-lg)] border-0 bg-transparent p-1 text-left hover:bg-[var(--fill-tertiary)] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-[var(--focus-color)]"
                    >
                      <SceneThumbnail
                        scene={layout.scene}
                        assets={assets}
                        measure={measure}
                        width={220}
                      />
                      <span className="text-[length:var(--type-footnote-size)] text-[var(--label)]">
                        {layout.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center rounded-[var(--corner-lg)] border border-dashed border-[var(--separator-strong)] p-6 text-center">
              <p className="m-0 max-w-sm text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
                Fill in the big line and choose Lay it out. About six layouts of your words appear
                here, in brand colors only.
              </p>
            </div>
          )}
        </section>
      </div>
    </Sheet>
  );
};
