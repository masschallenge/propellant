import {
  Button,
  PopUpButton,
  RadioCardGroup,
  SegmentedControl,
  Slider,
  Switch,
  Textarea,
} from '@masschallenge/propellant-web';
import { useEffect, useRef } from 'react';
import { BRAND_COLORS } from '../../brand/palette';
import { shapeReservation } from '../../studio/colorRules';
import { findFormat } from '../../studio/formats';
import {
  TREATMENT_NAMES,
  backdropFor,
  backdropName,
  logoMaximumHeight,
  logoMinimumHeight,
  logoTreatment,
  MINIMUM_LOGO_PIXELS,
  optionsForText,
  type SampleMap,
} from '../../studio/guardrails';
import {
  elementLabel,
  sceneFormat,
  type ImageElement,
  type LogoElement,
  type LogoLockup,
  type Scene,
  type SceneElement,
  type ShapeElement,
  type TextAlign,
  type TextElement,
} from '../../studio/scene';
import { scaleAroundCenter } from '../../studio/transform';
import {
  SIZE_STEPS,
  TEXT_ROLES,
  findTextRole,
  fontPixels,
  type SizeStepId,
  type TextRoleId,
} from '../../studio/typography';
import { ColorChoices } from './ColorChoices';
import { PanelSection } from './PanelSection';

export interface TextPatch {
  text?: string;
  role?: TextRoleId;
  size?: SizeStepId;
  colorId?: string;
  align?: TextAlign;
}

interface RightPanelProps {
  scene: Scene;
  element: SceneElement | null;
  samples: SampleMap;
  onChange: (next: SceneElement, key?: string) => void;
  onTextChange: (element: TextElement, patch: TextPatch) => void;
  onWordsSettled: (element: TextElement) => void;
  onRemove: (id: string) => void;
}

const ALIGN_ITEMS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
];

const percent = (value: number) => `${Math.round(value)}%`;
const degrees = (value: number) => `${Math.round(value)} degrees`;

const WORDS_SETTLE_MILLISECONDS = 700;

const LookControls = ({
  element,
  onChange,
}: {
  element: SceneElement;
  onChange: RightPanelProps['onChange'];
}) => (
  <PanelSection title="Look">
    <Slider
      className="pb-5"
      label="Opacity"
      showLabel
      min={10}
      max={100}
      step={5}
      value={Math.round(element.opacity * 100)}
      format={percent}
      onChange={(value) => onChange({ ...element, opacity: value / 100 }, `opacity-${element.id}`)}
    />
    <Slider
      className="pb-5"
      label="Rotate"
      showLabel
      min={-180}
      max={180}
      step={1}
      value={element.rotation}
      format={degrees}
      onChange={(value) => onChange({ ...element, rotation: value }, `rotate-${element.id}`)}
    />
  </PanelSection>
);

const WordsField = ({
  element,
  onTextChange,
  onWordsSettled,
}: {
  element: TextElement;
  onTextChange: RightPanelProps['onTextChange'];
  onWordsSettled: RightPanelProps['onWordsSettled'];
}) => {
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(element);
  latest.current = element;
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const settle = () => {
    window.clearTimeout(timer.current);
    onWordsSettled(latest.current);
  };
  return (
    <PanelSection title="Words">
      <Textarea
        label={<span className="sr-only">Words</span>}
        aria-label="Words"
        rows={3}
        value={element.text}
        onChange={(event) => {
          onTextChange(element, { text: event.target.value });
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(settle, WORDS_SETTLE_MILLISECONDS);
        }}
        onBlur={settle}
        hint={
          findTextRole(element.role).capitals === 'always'
            ? 'Oswald is always set in capitals.'
            : 'Sentence case. All caps turns back into sentence case.'
        }
      />
    </PanelSection>
  );
};

const TextControls = ({
  scene,
  element,
  samples,
  onChange,
  onTextChange,
  onWordsSettled,
}: Omit<RightPanelProps, 'element' | 'onRemove'> & { element: TextElement }) => {
  const format = sceneFormat(scene);
  const role = findTextRole(element.role);
  const backdrop = backdropFor(scene, element.id);
  const options = optionsForText(scene, element, samples);
  const sizeOptions = SIZE_STEPS.map((step) => {
    const allowed = role.sizes.includes(step.id);
    return {
      value: step.id,
      label: step.name,
      sub: `${fontPixels(step.id, format)}px`,
      description: allowed
        ? `${step.token}, ${step.pixels}px scaled to this canvas`
        : `${role.fontName} does not use this size`,
      disabled: !allowed,
    };
  });
  return (
    <>
      <WordsField element={element} onTextChange={onTextChange} onWordsSettled={onWordsSettled} />
      <PanelSection title="Style">
        <RadioCardGroup
          legend="Font and role"
          layout="row"
          name={`style-${element.id}`}
          value={element.role}
          onChange={(value) => onTextChange(element, { role: value as TextRoleId })}
          options={TEXT_ROLES.map((entry) => ({
            value: entry.id,
            title: entry.label,
            hint: entry.rule,
          }))}
        />
      </PanelSection>
      <PanelSection title="Size">
        <PopUpButton
          ariaLabel="Size"
          size="sm"
          value={element.size}
          options={sizeOptions}
          onChange={(value) => onTextChange(element, { size: value as SizeStepId })}
        />
      </PanelSection>
      <PanelSection title={`Color on ${backdropName(backdrop)}`}>
        <ColorChoices
          options={options}
          currentId={element.colorId}
          onChoose={(colorId) => onTextChange(element, { colorId })}
        />
        {backdrop.kind === 'photo' ? (
          <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
            Ratios are measured from the photo pixels under this text, at the darkest tenth.
          </p>
        ) : null}
        {backdrop.kind === 'pattern' ? (
          <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
            Each ratio is the lower of the two pattern colors, so the words read on every triangle.
          </p>
        ) : null}
        {backdrop.kind === 'mixed' ? (
          <p className="m-0 text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
            This text spans more than one background. Each ratio is the lowest across them, so every
            word reads.
          </p>
        ) : null}
      </PanelSection>
      <PanelSection title="Layout">
        <SegmentedControl
          aria-label="Alignment"
          size="sm"
          fullWidth
          items={ALIGN_ITEMS}
          value={element.align}
          onChange={(value) => onTextChange(element, { align: value as TextAlign })}
        />
        {role.capitals === 'always' ? (
          <Switch
            size="sm"
            checked
            disabled
            label="All caps"
            hint="Oswald is always set in capitals."
          />
        ) : null}
        <Slider
          className="pb-5"
          label="Box width"
          showLabel
          min={Math.round(format.width * 0.15)}
          max={format.width}
          step={1}
          value={Math.round(element.width)}
          format={(value) => `${value}px`}
          onChange={(value) => onChange({ ...element, width: value }, `width-${element.id}`)}
        />
      </PanelSection>
      <LookControls element={element} onChange={onChange} />
    </>
  );
};

const SizeSlider = ({
  element,
  label,
  min,
  max,
  onChange,
}: {
  element: SceneElement;
  label: string;
  min: number;
  max: number;
  onChange: RightPanelProps['onChange'];
}) => (
  <Slider
    className="pb-5"
    label={label}
    showLabel
    min={Math.round(min)}
    max={Math.round(max)}
    step={1}
    value={Math.round(Math.min(Math.max(element.width, min), max))}
    format={(value) => `${value}px wide`}
    onChange={(value) =>
      onChange(
        scaleAroundCenter(element, value, element.height * (value / element.width)),
        `size-${element.id}`,
      )
    }
  />
);

const ImageControls = ({
  scene,
  element,
  onChange,
}: {
  scene: Scene;
  element: ImageElement;
  onChange: RightPanelProps['onChange'];
}) => {
  const format = sceneFormat(scene);
  return (
    <>
      <PanelSection title="Photo">
        <SizeSlider
          element={element}
          label="Size"
          min={format.width * 0.1}
          max={format.width * 2}
          onChange={onChange}
        />
        <Slider
          className="pb-5"
          label="Zoom inside the frame"
          showLabel
          min={100}
          max={300}
          step={5}
          value={Math.round(element.zoom * 100)}
          format={percent}
          onChange={(value) => onChange({ ...element, zoom: value / 100 }, `zoom-${element.id}`)}
        />
        <Button
          size="sm"
          variant="gray"
          onClick={() =>
            onChange({ ...element, left: 0, top: 0, width: format.width, height: format.height })
          }
        >
          Fill the canvas
        </Button>
      </PanelSection>
      <LookControls element={element} onChange={onChange} />
    </>
  );
};

const ShapeControls = ({
  scene,
  element,
  onChange,
}: {
  scene: Scene;
  element: ShapeElement;
  onChange: RightPanelProps['onChange'];
}) => {
  const format = sceneFormat(scene);
  const options = BRAND_COLORS.map((color) => ({
    color,
    ratio: null,
    allowed: !shapeReservation(color.id),
    reason: shapeReservation(color.id),
  }));
  return (
    <>
      <PanelSection title="Color">
        <ColorChoices
          options={options}
          currentId={element.colorId}
          showRatio={false}
          onChoose={(colorId) => onChange({ ...element, colorId })}
        />
      </PanelSection>
      <PanelSection title="Size">
        <SizeSlider
          element={element}
          label="Width"
          min={format.width * 0.02}
          max={format.width * 2}
          onChange={onChange}
        />
        {element.shape !== 'line' ? (
          <Slider
            className="pb-5"
            label="Height"
            showLabel
            min={Math.round(format.height * 0.02)}
            max={format.height * 2}
            step={1}
            value={Math.round(element.height)}
            format={(value) => `${value}px tall`}
            onChange={(value) =>
              onChange(scaleAroundCenter(element, element.width, value), `height-${element.id}`)
            }
          />
        ) : null}
      </PanelSection>
      <LookControls element={element} onChange={onChange} />
    </>
  );
};

const LOCKUP_ITEMS = [
  { id: 'horizontal', label: 'Horizontal' },
  { id: 'monogram', label: 'Monogram' },
];

const LogoControls = ({
  scene,
  element,
  samples,
  onChange,
}: {
  scene: Scene;
  element: LogoElement;
  samples: SampleMap;
  onChange: RightPanelProps['onChange'];
}) => {
  const format = sceneFormat(scene);
  const backdrop = backdropFor(scene, element.id);
  const treatment = logoTreatment(backdrop);
  const minimum = logoMinimumHeight(element.lockup, format);
  const maximum = logoMaximumHeight(element.lockup, format);
  const isMeasured = backdrop.kind === 'photo' && Boolean(samples[element.id]);
  return (
    <>
      <PanelSection title="Lockup">
        <SegmentedControl
          aria-label="Lockup"
          size="sm"
          fullWidth
          items={LOCKUP_ITEMS}
          value={element.lockup}
          onChange={(value) => onChange({ ...element, lockup: value as LogoLockup })}
        />
      </PanelSection>
      <PanelSection title="Size">
        <Slider
          className="pb-5"
          label="Height"
          showLabel
          min={Math.ceil(minimum)}
          max={Math.floor(maximum)}
          step={1}
          value={Math.round(element.height)}
          format={(value) => `${value}px tall`}
          onChange={(value) =>
            onChange(
              scaleAroundCenter(element, element.width * (value / element.height), value),
              `size-${element.id}`,
            )
          }
        />
        <p className="m-0 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
          Never below {MINIMUM_LOGO_PIXELS[element.lockup]}px on screen ({Math.round(minimum)}px on
          this {findFormat(scene.formatId).name} canvas). Half its height stays clear from every
          edge.
        </p>
      </PanelSection>
      <PanelSection title="Treatment">
        <p className="m-0 text-[length:var(--type-callout-size)] text-[var(--label)]">
          {TREATMENT_NAMES[treatment]}, because it sits on{' '}
          {backdrop.kind === 'photo' ? 'a photo' : backdropName(backdrop)}.
          {isMeasured ? ' The photo under it is measured for contrast.' : ''}
        </p>
        <p className="m-0 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
          The logo is never rotated, faded, stretched or recolored, so it has no look controls.
        </p>
      </PanelSection>
    </>
  );
};

export const RightPanel = (props: RightPanelProps) => {
  const { scene, element, samples, onChange, onRemove } = props;
  if (!element) {
    return (
      <aside aria-label="Selected item" className="flex flex-col">
        <PanelSection title="Nothing selected" headingLevel="h2">
          <p className="m-0 text-[length:var(--type-callout-size)] text-[var(--label-secondary)]">
            Select something on the canvas or in Layers to change it. Every choice here is limited
            to what the MassChallenge brand allows.
          </p>
        </PanelSection>
      </aside>
    );
  }
  return (
    <aside aria-label="Selected item" className="flex flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-solid border-[var(--separator)] px-4 py-3">
        <h2 className="m-0 min-w-0 truncate text-[length:var(--type-headline-size)] font-semibold text-[var(--label)]">
          {elementLabel(element)}
        </h2>
        <Button
          size="sm"
          variant="plain"
          destructive
          disabled={element.locked}
          onClick={() => onRemove(element.id)}
        >
          Delete
        </Button>
      </div>
      {element.kind === 'text' ? <TextControls {...props} element={element} /> : null}
      {element.kind === 'image' ? (
        <ImageControls scene={scene} element={element} onChange={onChange} />
      ) : null}
      {element.kind === 'shape' ? (
        <ShapeControls scene={scene} element={element} onChange={onChange} />
      ) : null}
      {element.kind === 'logo' ? (
        <LogoControls scene={scene} element={element} samples={samples} onChange={onChange} />
      ) : null}
    </aside>
  );
};
