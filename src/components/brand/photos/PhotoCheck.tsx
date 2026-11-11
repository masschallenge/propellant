import {
  Banner,
  Button,
  FileUploader,
  Logo,
  SegmentedControl,
  Slider,
  Switch,
  TextField,
} from '@masschallenge/propellant-web';
import { useEffect, useMemo, useRef, useState } from 'react';
import { contrastRatio } from '../../../brand/contrast';
import { findColor } from '../../../brand/palette';
import { MINIMUM_PHOTO_WIDTH } from '../../../brand/photo-library';
import {
  INK,
  LOGO_AREA,
  PHOTO_SHAPES,
  SAFE_ZONE_INSET,
  TEXT_AREAS,
  WHITE,
  PHOTO_BACKING,
  applyDuotone,
  betterText,
  fitBox,
  formatRatio,
  logoTreatmentFor,
  readArea,
  safeZone,
  toPixels,
  verdictFor,
  type AreaReading,
  type Box,
  type ContrastReading,
  type ContrastVerdict,
  type FitMode,
  type TextPlacement,
} from '../../../brand/photo-check';

interface LoadedPhoto {
  name: string;
  width: number;
  height: number;
  displayUrl: string;
  analysis: ImageData;
}

type Treatment = 'natural' | 'duotone';
type TextColor = 'white' | 'ink';

const ANALYSIS_SIZE = 480;
const DISPLAY_SIZE = 1600;
const FULL_SLIDE_WIDTH = 1920;
const DEEP_TEAL = findColor('deep-teal').hex;

const VERDICT_TEXT: Record<ContrastVerdict, string> = {
  any: 'Passes for text of any size',
  large: 'Large text only, 18 pt (24px) and up',
  never: 'Too low for text',
};

const VERDICT_MARK: Record<ContrastVerdict, string> = {
  any: 'Pass',
  large: 'Large only',
  never: 'Fail',
};

const percentBox = (box: Box, frameWidth: number, frameHeight: number) => ({
  left: `${(box.x / frameWidth) * 100}%`,
  top: `${(box.y / frameHeight) * 100}%`,
  width: `${(box.width / frameWidth) * 100}%`,
  height: `${(box.height / frameHeight) * 100}%`,
});

const drawScaled = (image: HTMLImageElement, longest: number, treatment: Treatment) => {
  const scale = Math.min(1, longest / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('This browser cannot read images');
  context.fillStyle = PHOTO_BACKING;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (treatment === 'duotone') {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    applyDuotone(pixels.data);
    context.putImageData(pixels, 0, 0);
  }
  return { canvas, context };
};

const readRegion = (analysis: ImageData, area: Box): AreaReading => {
  const region = toPixels(area, analysis.width, analysis.height);
  const pixels: number[] = [];
  for (let row = region.y; row < Math.min(analysis.height, region.y + region.height); row += 1) {
    const start = (row * analysis.width + region.x) * 4;
    const end = (row * analysis.width + Math.min(analysis.width, region.x + region.width)) * 4;
    for (let offset = start; offset < end; offset += 1) pixels.push(analysis.data[offset]);
  }
  return readArea(pixels);
};

const ReadingRow = ({
  label,
  reading,
  isChosen,
}: {
  label: string;
  reading: ContrastReading;
  isChosen: boolean;
}) => (
  <tr className="border-0 border-t border-solid border-[var(--separator)]">
    <th scope="row" className="py-2 pr-3 text-left font-semibold">
      {label}
      {isChosen ? (
        <span className="ml-1 font-normal text-[var(--label-secondary)]">(in use)</span>
      ) : null}
    </th>
    <td className="py-2 pr-3 tabular-nums">{formatRatio(reading.typical)}</td>
    <td className="py-2 pr-3 tabular-nums">{formatRatio(reading.weakest)}</td>
    <td className="py-2">
      <span className="font-semibold">{VERDICT_MARK[reading.verdict]}.</span>{' '}
      <span className="text-[var(--label-secondary)]">{VERDICT_TEXT[reading.verdict]}</span>
    </td>
  </tr>
);

const PhotoCheck = () => {
  const [source, setSource] = useState<{ url: string; name: string } | null>(null);
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [error, setError] = useState('');
  const [treatment, setTreatment] = useState<Treatment>('natural');
  const [placement, setPlacement] = useState<TextPlacement>('bottom');
  const [textColor, setTextColor] = useState<TextColor | null>(null);
  const [hasPanel, setHasPanel] = useState(false);
  const [headline, setHeadline] = useState('');
  const [fitMode, setFitMode] = useState<FitMode>('whole');
  const [focusAcross, setFocusAcross] = useState(50);
  const [focusDown, setFocusDown] = useState(50);
  const sourceUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    },
    [],
  );

  useEffect(() => {
    if (!source) return undefined;
    let isCurrent = true;
    const image = new Image();
    image.onload = () => {
      if (!isCurrent) return;
      try {
        const analysis = drawScaled(image, ANALYSIS_SIZE, treatment);
        const display = drawScaled(image, DISPLAY_SIZE, treatment).canvas;
        setPhoto({
          name: source.name,
          width: image.naturalWidth,
          height: image.naturalHeight,
          displayUrl: display.toDataURL('image/jpeg', 0.9),
          analysis: analysis.context.getImageData(
            0,
            0,
            analysis.canvas.width,
            analysis.canvas.height,
          ),
        });
        setError('');
      } catch {
        setError('We could not read that photo. Try a JPG or PNG.');
      }
    };
    image.onerror = () => {
      if (isCurrent) setError('We could not open that file. Try a JPG or PNG.');
    };
    image.src = source.url;
    return () => {
      isCurrent = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [source, treatment]);

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('That file is not an image. Choose a JPG or PNG.');
      return;
    }
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    const url = URL.createObjectURL(file);
    sourceUrl.current = url;
    setTextColor(null);
    setSource({ url, name: file.name });
  };

  const handleReset = () => {
    if (sourceUrl.current) URL.revokeObjectURL(sourceUrl.current);
    sourceUrl.current = null;
    setSource(null);
    setPhoto(null);
  };

  const readings = useMemo(
    () =>
      photo
        ? {
            text: readRegion(photo.analysis, TEXT_AREAS[placement]),
            logo: readRegion(photo.analysis, LOGO_AREA),
          }
        : null,
    [photo, placement],
  );

  const chosenColor: TextColor = hasPanel
    ? 'white'
    : (textColor ?? (readings ? betterText(readings.text) : 'white'));
  const panelRatio = contrastRatio(chosenColor === 'white' ? WHITE : INK, DEEP_TEAL);
  const chosenReading = readings ? readings.text[chosenColor] : null;

  if (!photo || !readings || !chosenReading) {
    return (
      <div className="flex flex-col gap-3">
        <FileUploader
          accept="image/*"
          label="Drop a photo here, or"
          ctaLabel="choose one"
          hint="JPG, PNG or WebP. It stays in this browser and is never uploaded."
          onFiles={handleFiles}
          error={Boolean(error)}
        />
        <p aria-live="polite" className="m-0 text-footnote text-[var(--critical)]">
          {error}
        </p>
      </div>
    );
  }

  const logoTreatment = logoTreatmentFor(readings.logo);
  const textArea = TEXT_AREAS[placement];
  const textStyle = percentBox(textArea, 1, 1);
  const logoStyle = percentBox(LOGO_AREA, 1, 1);
  const textHex = chosenColor === 'white' ? WHITE : INK;
  const summary = hasPanel
    ? `On the Deep teal panel, ${chosenColor === 'white' ? 'White' : 'Ink'} text measures ${formatRatio(panelRatio)}. ${VERDICT_TEXT[verdictFor(panelRatio)]}.`
    : `${chosenColor === 'white' ? 'White' : 'Ink'} text over this part of the photo measures ${formatRatio(chosenReading.weakest)} at its weakest. ${VERDICT_TEXT[chosenReading.verdict]}.`;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="m-0 text-callout text-[var(--label-secondary)]">
          Checking <span className="font-semibold text-[var(--label)]">{photo.name}</span>,{' '}
          {photo.width} by {photo.height} pixels. It has not left this browser.
        </p>
        <Button variant="gray" size="sm" onClick={handleReset}>
          Choose another photo
        </Button>
      </div>

      {photo.width < MINIMUM_PHOTO_WIDTH ? (
        <Banner tone="warning" title="This photo may look blurry">
          It is {photo.width} pixels wide. Use at least {MINIMUM_PHOTO_WIDTH} pixels for a half
          slide or a document page, and {FULL_SLIDE_WIDTH} for a full slide.
        </Banner>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <figure className="m-0 flex flex-col gap-2">
          <div
            className="relative w-full overflow-hidden rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] [container-type:inline-size]"
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
          >
            <img
              src={photo.displayUrl}
              alt="Your photo, with the logo and a headline over it"
              className="absolute inset-0 block h-full w-full"
            />
            <div className="absolute" style={logoStyle}>
              <Logo
                treatment={logoTreatment}
                className="!h-auto !w-full !max-w-none"
                label={`MassChallenge logo, ${logoTreatment} treatment`}
              />
            </div>
            <div
              className="absolute flex"
              style={{
                ...textStyle,
                alignItems: placement === 'top' ? 'flex-start' : 'flex-end',
              }}
            >
              <p
                className={`m-0 font-[family-name:var(--type-family-brand)] text-[7cqw] font-medium uppercase leading-[1.02] ${
                  hasPanel ? 'rounded-[var(--corner-md)] px-[2.4cqw] py-[1.6cqw]' : ''
                }`}
                style={{ color: textHex, backgroundColor: hasPanel ? DEEP_TEAL : undefined }}
              >
                {headline.trim() || 'Your headline'}
              </p>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute border-2 border-dashed border-[var(--yellow-400)]"
              style={textStyle}
            />
          </div>
          <figcaption className="text-footnote text-[var(--label-secondary)]">
            The dashed yellow box is the area we measure. The {logoTreatment} logo was picked
            because it reads better on that corner of your photo.
          </figcaption>
        </figure>

        <div className="flex flex-col gap-5">
          <TextField
            label="Headline"
            placeholder="Your headline"
            hint="Short and in capitals, like every Oswald headline."
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />
          <div className="flex flex-col gap-2">
            <span className="text-callout font-semibold">Where the text sits</span>
            <SegmentedControl
              aria-label="Where the text sits"
              items={[
                { id: 'top', label: 'Top' },
                { id: 'bottom', label: 'Bottom' },
              ]}
              value={placement}
              onChange={(id) => setPlacement(id as TextPlacement)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-callout font-semibold">Text color</span>
            <SegmentedControl
              aria-label="Text color"
              items={[
                { id: 'white', label: 'White' },
                { id: 'ink', label: 'Ink', disabled: hasPanel },
              ]}
              value={chosenColor}
              onChange={(id) => setTextColor(id as TextColor)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-callout font-semibold">Color treatment</span>
            <SegmentedControl
              aria-label="Color treatment"
              items={[
                { id: 'natural', label: 'Natural color' },
                { id: 'duotone', label: 'Brand duotone' },
              ]}
              value={treatment}
              onChange={(id) => setTreatment(id as Treatment)}
            />
            <p className="m-0 text-footnote text-[var(--label-secondary)]">
              Duotone is for big brand moments. Never use it where the people need to look like
              themselves, such as a founder portrait.
            </p>
          </div>
          <Switch
            label="Put the text on a Deep teal panel"
            hint="The fix when the photo is too busy behind the words. Text on Deep teal is always White."
            checked={hasPanel}
            onChange={setHasPanel}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h4 className="m-0 text-headline">Measured contrast</h4>
        <p aria-live="polite" className="m-0 text-body">
          {summary}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-callout">
            <caption className="sr-only">
              Contrast of White and Ink text over the measured area of your photo
            </caption>
            <thead>
              <tr className="text-left text-footnote text-[var(--label-secondary)]">
                <th scope="col" className="pb-2 pr-3 font-semibold">
                  Text
                </th>
                <th scope="col" className="pb-2 pr-3 font-semibold">
                  Typical
                </th>
                <th scope="col" className="pb-2 pr-3 font-semibold">
                  Weakest 5%
                </th>
                <th scope="col" className="pb-2 font-semibold">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              <ReadingRow
                label="White"
                reading={readings.text.white}
                isChosen={chosenColor === 'white'}
              />
              <ReadingRow
                label="Ink"
                reading={readings.text.ink}
                isChosen={chosenColor === 'ink'}
              />
            </tbody>
          </table>
        </div>
        <p className="m-0 text-footnote text-[var(--label-secondary)]">
          We read every pixel in the measured area and compare it with White and Ink. Typical is the
          middle value. Weakest 5% is the value that the lowest twentieth of the area falls below,
          so a busy patch shows up even when most of the area is calm. Text needs 4.5:1, or 3:1 when
          it is 18 pt (24px) and up.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h4 className="m-0 text-headline">The same photo in common shapes</h4>
            <p className="m-0 mt-1 max-w-[60ch] text-callout text-[var(--label-secondary)]">
              We show your whole photo first. Fill the shape only if you choose to crop it, and keep
              faces whole.
            </p>
          </div>
          <SegmentedControl
            aria-label="How the photo fits each shape"
            items={[
              { id: 'whole', label: 'Whole photo' },
              { id: 'fill', label: 'Fill and crop' },
            ]}
            value={fitMode}
            onChange={(id) => setFitMode(id as FitMode)}
          />
        </div>
        {fitMode === 'fill' ? (
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Slider
              label="Move across"
              showLabel
              value={focusAcross}
              onChange={setFocusAcross}
              format={(value) => `${value}%`}
            />
            <Slider
              label="Move up and down"
              showLabel
              value={focusDown}
              onChange={setFocusDown}
              format={(value) => `${value}%`}
            />
          </div>
        ) : null}
        <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-4">
          {PHOTO_SHAPES.map((shape) => {
            const frameWidth = shape.width * 100;
            const frameHeight = shape.height * 100;
            const box = fitBox(photo.width, photo.height, frameWidth, frameHeight, fitMode, {
              x: focusAcross / 100,
              y: focusDown / 100,
            });
            return (
              <li key={shape.id} className="flex flex-col gap-2">
                <div
                  className="relative w-full overflow-hidden rounded-[var(--corner-md)] bg-[var(--bg-secondary)] shadow-[inset_0_0_0_1px_var(--separator)]"
                  style={{ aspectRatio: `${shape.width} / ${shape.height}` }}
                >
                  <img
                    src={photo.displayUrl}
                    alt=""
                    className="absolute block max-w-none"
                    style={percentBox(box, frameWidth, frameHeight)}
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute border border-dashed border-white/90 shadow-[0_0_0_1px_rgb(0_0_0/0.35)]"
                    style={percentBox(safeZone(frameWidth, frameHeight), frameWidth, frameHeight)}
                  />
                </div>
                <p className="m-0 text-footnote">
                  <span className="font-semibold">{shape.label}</span>{' '}
                  <span className="text-[var(--label-secondary)]">{shape.description}</span>
                </p>
              </li>
            );
          })}
        </ul>
        <p className="m-0 text-footnote text-[var(--label-secondary)]">
          The dashed frame marks a safe zone {SAFE_ZONE_INSET * 100}% in from the shorter side,
          where faces, words and the logo are least likely to be cut off by an app. It is a working
          guide, not a MassChallenge rule.
        </p>
      </div>
    </div>
  );
};

export default PhotoCheck;
