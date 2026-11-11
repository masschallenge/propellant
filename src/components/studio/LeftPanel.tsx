import { Button, Switch } from '@masschallenge/propellant-web';
import { useRef, useState } from 'react';
import { backgroundColors } from '../../studio/colorRules';
import {
  PATTERN_NAMES,
  patternColors,
  trianglePattern,
  type PatternId,
} from '../../studio/patterns';
import {
  LOGO_NAMES,
  type LayerDirection,
  type LogoLockup,
  type Scene,
  type ShapeKind,
} from '../../studio/scene';
import type { TextRoleId } from '../../studio/typography';
import { LOGO_URLS } from './assets';
import { ArrowLeftIcon } from './icons';
import { LayersList } from './LayersList';
import { PanelSection } from './PanelSection';
import type { PhotoAsset } from './useStudioAssets';

interface LeftPanelProps {
  scene: Scene;
  selectedId: string | null;
  photos: PhotoAsset[];
  onAddText: (role: TextRoleId) => void;
  onAddLogo: (lockup: LogoLockup) => void;
  onAddShape: (shape: ShapeKind) => void;
  onAddPhoto: (photo: PhotoAsset, isDuotone: boolean) => void;
  onUploadPhoto: (file: File, isDuotone: boolean) => void;
  onBackground: (colorId: string) => void;
  onPattern: (pattern: PatternId | null) => void;
  onSelect: (id: string | null) => void;
  onMove: (id: string, direction: LayerDirection) => void;
  onToggle: (id: string, property: 'hidden' | 'locked') => void;
  onRemove: (id: string) => void;
}

const TYPE_BUTTONS: { role: TextRoleId; label: string }[] = [
  { role: 'headline', label: 'Add a headline' },
  { role: 'body', label: 'Add body text' },
  { role: 'bold', label: 'Add a small line' },
];

const SHAPE_BUTTONS: { shape: ShapeKind; label: string }[] = [
  { shape: 'block', label: 'Block' },
  { shape: 'circle', label: 'Circle' },
  { shape: 'line', label: 'Line' },
];

const LOGO_BUTTONS: LogoLockup[] = ['horizontal', 'monogram'];

const SWATCH_SIDE = 20;

const PatternSwatch = () => (
  <svg
    viewBox={`0 0 ${SWATCH_SIDE} ${SWATCH_SIDE}`}
    aria-hidden="true"
    className="h-5 w-5 shrink-0 rounded-[var(--corner-sm)] border border-solid border-[var(--separator-strong)]"
  >
    {trianglePattern(SWATCH_SIDE, SWATCH_SIDE, 8).map((triangle, index) => (
      <polygon
        key={index}
        points={triangle.points.map((point) => point.join(',')).join(' ')}
        fill={patternColors('triangles').find((color) => color.id === triangle.colorId)?.hex}
      />
    ))}
  </svg>
);

const OPTION_CLASS =
  'flex cursor-pointer items-center gap-2 rounded-[var(--corner-md)] border border-solid px-2 py-1.5 text-left text-[length:var(--type-subheadline-size)] text-[var(--label)] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-[var(--focus-color)]';

const optionState = (isCurrent: boolean) =>
  isCurrent
    ? 'border-[var(--tint)] bg-[var(--tint-fill)] font-semibold'
    : 'border-transparent bg-transparent hover:bg-[var(--fill-tertiary)]';

export const LeftPanel = ({
  scene,
  selectedId,
  photos,
  onAddText,
  onAddLogo,
  onAddShape,
  onAddPhoto,
  onUploadPhoto,
  onBackground,
  onPattern,
  onSelect,
  onMove,
  onToggle,
  onRemove,
}: LeftPanelProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDuotone, setIsDuotone] = useState(false);
  const libraryPhotos = photos.filter((photo) => !photo.isDuotone);
  const isPatternOn = scene.pattern === 'triangles';
  return (
    <aside aria-label="Add to the post" className="flex flex-col">
      <div className="px-4 pt-4">
        <Button href="/brand/" variant="plain" size="sm" iconLeading={<ArrowLeftIcon />}>
          Back to the guide
        </Button>
      </div>
      <PanelSection title="Type">
        <div className="flex flex-col gap-1.5">
          {TYPE_BUTTONS.map((entry) => (
            <Button key={entry.role} size="sm" variant="gray" onClick={() => onAddText(entry.role)}>
              {entry.label}
            </Button>
          ))}
        </div>
      </PanelSection>
      <PanelSection title="Brand marks">
        <div className="grid grid-cols-2 gap-2">
          {LOGO_BUTTONS.map((lockup) => (
            <button
              key={lockup}
              type="button"
              onClick={() => onAddLogo(lockup)}
              aria-label={`Add the ${LOGO_NAMES[lockup]}`}
              className="flex h-16 cursor-pointer items-center justify-center rounded-[var(--corner-md)] border border-solid border-[var(--separator-strong)] bg-[var(--gray-0)] p-2 hover:border-[var(--tint)] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-color)]"
            >
              <img src={LOGO_URLS[`${lockup}-color`]} alt="" className="max-h-8 max-w-full" />
            </button>
          ))}
        </div>
        <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
          The studio picks the full color, white or black logo for whatever sits behind it.
        </p>
      </PanelSection>
      <PanelSection title="Backgrounds">
        <div className="grid grid-cols-1 gap-1" role="group" aria-label="Background color">
          {backgroundColors().map((color) => {
            const isCurrent = !isPatternOn && scene.backgroundId === color.id;
            return (
              <button
                key={color.id}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => onBackground(color.id)}
                className={`${OPTION_CLASS} ${optionState(isCurrent)}`}
              >
                <span
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 rounded-[var(--corner-sm)] border border-solid border-[var(--separator-strong)]"
                  style={{ background: color.hex }}
                />
                <span className="flex-1">{color.name}</span>
                {isCurrent ? (
                  <span className="text-[length:var(--type-caption-size)]">Current</span>
                ) : null}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={isPatternOn}
            onClick={() => onPattern(isPatternOn ? null : 'triangles')}
            className={`${OPTION_CLASS} ${optionState(isPatternOn)}`}
          >
            <PatternSwatch />
            <span className="flex-1">{PATTERN_NAMES.triangles}</span>
            {isPatternOn ? (
              <span className="text-[length:var(--type-caption-size)]">Current</span>
            ) : null}
          </button>
        </div>
        <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
          The brand pattern: Bright teal and Pale teal triangles. Text on it must read on both
          colors, so white text is switched to a color that does.
        </p>
      </PanelSection>
      <PanelSection title="Photos">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          data-studio-photo-input
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUploadPhoto(file, isDuotone);
            event.target.value = '';
          }}
        />
        <Button size="sm" variant="gray" onClick={() => fileRef.current?.click()}>
          Upload your own
        </Button>
        <Switch
          size="sm"
          checked={isDuotone}
          onChange={setIsDuotone}
          label="Add in teal duotone"
          hint="Deep teal shadows to Bright teal highlights. Not for portraits."
        />
        <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
          Your photos stay in this browser and are never uploaded. To use a MassChallenge photo,
          download it from the photo library in the brand guide.
        </p>
        {libraryPhotos.length ? (
          <div className="grid grid-cols-3 gap-1.5">
            {libraryPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => onAddPhoto(photo, isDuotone)}
                aria-label={`Add ${photo.name} to the canvas${isDuotone ? ' in teal duotone' : ''}`}
                className="aspect-square cursor-pointer overflow-hidden rounded-[var(--corner-sm)] border border-solid border-[var(--separator-strong)] bg-[var(--bg-secondary)] p-0 focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-[var(--focus-color)]"
              >
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </PanelSection>
      <PanelSection title="Shapes">
        <div className="grid grid-cols-3 gap-1.5">
          {SHAPE_BUTTONS.map((entry) => (
            <Button
              key={entry.shape}
              size="sm"
              variant="gray"
              aria-label={`Add a ${entry.label.toLowerCase()}`}
              onClick={() => onAddShape(entry.shape)}
            >
              {entry.label}
            </Button>
          ))}
        </div>
      </PanelSection>
      <PanelSection title="Layers">
        <LayersList
          scene={scene}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      </PanelSection>
    </aside>
  );
};
