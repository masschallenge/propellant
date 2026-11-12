import { findColor } from '../brand/palette';
import { contrastRatio } from '../brand/contrast';
import { textReservation } from './colorRules';
import { findFormat, isLandscape, type PostFormat } from './formats';
import { constrainLogo } from './guardrails';
import { createChooser, type Chooser } from './random';
import {
  BASE_DEFAULTS,
  LOGO_ASPECT,
  layoutTextElement,
  type ImageElement,
  type LogoElement,
  type LogoLockup,
  type Scene,
  type SceneElement,
  type ShapeElement,
  type TextAlign,
  type TextElement,
} from './scene';
import { isAllCaps, toSentenceCase, type MeasureText } from './text';
import {
  canvasScale,
  linePixels,
  requiredContrast,
  type SizeStepId,
  type TextRoleId,
} from './typography';

export interface BriefPhoto {
  id: string;
  width: number;
  height: number;
}

export interface Brief {
  formatId: string;
  smallLine: string;
  bigLine: string;
  details: string;
  callToAction: string;
  photo: BriefPhoto | null;
}

export interface LayoutOption {
  id: string;
  name: string;
  scene: Scene;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

type SlotId = 'eyebrow' | 'headline' | 'details' | 'cta';

type ColorPreferences = Record<SlotId, string[]>;

interface StackRequest {
  brief: Brief;
  format: PostFormat;
  box: Box;
  align: TextAlign;
  anchor: 'top' | 'center' | 'bottom';
  backdropId: string;
  preferences: ColorPreferences;
  choose: Chooser;
  measure: MeasureText;
  prefix: string;
}

interface SlotPlan {
  slot: SlotId;
  role: TextRoleId;
  size: SizeStepId;
  text: string;
}

const HEADLINE_SIZES: SizeStepId[] = ['display', 'heading-1', 'heading-2'];

const LIGHT_TEXT: ColorPreferences = {
  eyebrow: ['teal', 'black'],
  headline: ['black', 'teal'],
  details: ['black'],
  cta: ['teal', 'black'],
};

const DARK_TEXT: ColorPreferences = {
  eyebrow: ['cyan', 'white'],
  headline: ['white', 'cyan'],
  details: ['white'],
  cta: ['white', 'cyan'],
};

const spacing = (format: PostFormat, units: number) => units * canvasScale(format);

const passingColors = (preferences: string[], backdropId: string, required: number) => {
  const backdropHex = findColor(backdropId).hex;
  const passing = preferences.filter(
    (colorId) =>
      !textReservation(colorId, [backdropId]) &&
      contrastRatio(findColor(colorId).hex, backdropHex) >= required,
  );
  if (passing.length) return passing;
  return ['white', 'black'].sort(
    (first, second) =>
      contrastRatio(findColor(second).hex, backdropHex) -
      contrastRatio(findColor(first).hex, backdropHex),
  );
};

const cleanBodyText = (text: string) => {
  const trimmed = text.trim();
  return isAllCaps(trimmed) ? toSentenceCase(trimmed) : trimmed;
};

const planSlots = (brief: Brief, headlineSize: SizeStepId): SlotPlan[] =>
  [
    { slot: 'eyebrow', role: 'bold', size: 'lead', text: cleanBodyText(brief.smallLine) },
    {
      slot: 'headline',
      role: 'headline',
      size: headlineSize,
      text: brief.bigLine.trim().toUpperCase(),
    },
    { slot: 'details', role: 'body', size: 'body', text: cleanBodyText(brief.details) },
    { slot: 'cta', role: 'bold', size: 'lead', text: cleanBodyText(brief.callToAction) },
  ].filter((plan): plan is SlotPlan => Boolean(plan.text));

const SLOT_GAPS: Record<SlotId, number> = { eyebrow: 8, headline: 14, details: 14, cta: 0 };

export const buildTextStack = (request: StackRequest): TextElement[] => {
  const { brief, format, box, align, anchor, backdropId, preferences, choose, measure, prefix } =
    request;
  const build = (headlineSize: SizeStepId) => {
    const elements = planSlots(brief, headlineSize).map((plan) => {
      const colors = passingColors(
        preferences[plan.slot],
        backdropId,
        requiredContrast(plan.role, plan.size),
      );
      const element: TextElement = {
        ...BASE_DEFAULTS,
        id: `${prefix}-${plan.slot}`,
        kind: 'text',
        role: plan.role,
        size: plan.size,
        colorId: choose(colors),
        align,
        text: plan.text,
        left: box.left,
        top: 0,
        width: box.width,
        height: linePixels(plan.size, format, plan.role),
      };
      return { plan, element: layoutTextElement(element, format, measure) };
    });
    const total = elements.reduce(
      (sum, entry, index) =>
        sum +
        entry.element.height +
        (index < elements.length - 1 ? spacing(format, SLOT_GAPS[entry.plan.slot]) : 0),
      0,
    );
    return { elements, total };
  };
  const attempts = HEADLINE_SIZES.map(build);
  const chosen =
    attempts.find((attempt) => attempt.total <= box.height) ?? attempts[attempts.length - 1];
  const offsets = {
    top: 0,
    center: (box.height - chosen.total) / 2,
    bottom: box.height - chosen.total,
  };
  let cursor = box.top + Math.max(0, offsets[anchor]);
  return chosen.elements.map((entry) => {
    const placed = { ...entry.element, top: cursor };
    cursor += entry.element.height + spacing(format, SLOT_GAPS[entry.plan.slot]);
    return placed;
  });
};

const logoHeight = (format: PostFormat, lockup: LogoLockup) =>
  spacing(format, lockup === 'horizontal' ? 30 : 40);

const placeLogo = (
  format: PostFormat,
  lockup: LogoLockup,
  left: number,
  top: number,
  id: string,
  height = logoHeight(format, lockup),
): LogoElement =>
  constrainLogo(
    {
      ...BASE_DEFAULTS,
      id,
      kind: 'logo',
      lockup,
      left,
      top,
      height,
      width: height * LOGO_ASPECT[lockup],
    },
    format,
  );

const block = (id: string, colorId: string, box: Box): ShapeElement => ({
  ...BASE_DEFAULTS,
  ...box,
  id,
  kind: 'shape',
  shape: 'block',
  colorId,
});

const photoElement = (id: string, photo: BriefPhoto, box: Box): ImageElement => ({
  ...BASE_DEFAULTS,
  ...box,
  id,
  kind: 'image',
  photoId: photo.id,
  naturalWidth: photo.width,
  naturalHeight: photo.height,
  zoom: 1,
});

const preferencesFor = (backdropId: string) => {
  const backdropHex = findColor(backdropId).hex;
  return contrastRatio(findColor('white').hex, backdropHex) >=
    contrastRatio(findColor('black').hex, backdropHex)
    ? DARK_TEXT
    : LIGHT_TEXT;
};

const colorName = (colorId: string) => findColor(colorId).name;

interface LayoutContext {
  brief: Brief;
  format: PostFormat;
  choose: Chooser;
  measure: MeasureText;
  margin: number;
}

const headlineColorName = (elements: SceneElement[]) => {
  const headline = elements.find(
    (element): element is TextElement => element.kind === 'text' && element.role === 'headline',
  );
  return headline ? colorName(headline.colorId).toLowerCase() : 'no';
};

const brandColorLayout = (context: LayoutContext): LayoutOption => {
  const { brief, format, choose, measure, margin } = context;
  const backgroundId = choose(['navy', 'deep-teal', 'black']);
  const logo = placeLogo(
    format,
    'horizontal',
    margin,
    format.height - margin - logoHeight(format, 'horizontal'),
    'brand-logo',
  );
  const text = buildTextStack({
    brief,
    format,
    box: {
      left: margin,
      top: margin,
      width: format.width - margin * 2,
      height: logo.top - margin * 2,
    },
    align: 'left',
    anchor: 'center',
    backdropId: backgroundId,
    preferences: DARK_TEXT,
    choose,
    measure,
    prefix: 'brand',
  });
  const elements: SceneElement[] = [...text, logo];
  return {
    id: 'brand-color',
    name: `${colorName(backgroundId)} background with a ${headlineColorName(elements)} headline`,
    scene: { formatId: format.id, backgroundId, elements },
  };
};

const shiftElements = <Element extends SceneElement>(elements: Element[], offset: number) =>
  elements.map((element) => ({ ...element, top: element.top + offset }));

const stackHeight = (elements: SceneElement[]) =>
  elements.length
    ? Math.max(...elements.map((element) => element.top + element.height)) -
      Math.min(...elements.map((element) => element.top))
    : 0;

const photoPanelLayout = (context: LayoutContext): LayoutOption => {
  const { brief, format, choose, measure, margin } = context;
  const panelId = choose(['navy', 'deep-teal', 'white']);
  const landscape = isLandscape(format);
  const fullCanvas: Box = { left: 0, top: 0, width: format.width, height: format.height };
  const base: SceneElement = brief.photo
    ? photoElement('panel-photo', brief.photo, fullCanvas)
    : block('panel-color-block', choose(['mc-blue', 'warm-white']), fullCanvas);
  const logo = placeLogo(format, 'horizontal', margin, margin, 'panel-logo');
  const stack = (box: Box, anchor: 'top' | 'center') =>
    buildTextStack({
      brief,
      format,
      box,
      align: 'left',
      anchor,
      backdropId: panelId,
      preferences: preferencesFor(panelId),
      choose,
      measure,
      prefix: 'panel',
    });
  let panelBox: Box;
  let text: TextElement[];
  if (landscape) {
    panelBox = {
      left: format.width * 0.5,
      top: 0,
      width: format.width * 0.5,
      height: format.height,
    };
    text = stack(
      {
        left: panelBox.left + margin,
        top: margin,
        width: panelBox.width - margin * 2,
        height: format.height - margin * 2,
      },
      'center',
    );
  } else {
    const maximumPanel = format.height - (logo.top + logo.height + margin);
    const drafted = stack(
      { left: margin, top: 0, width: format.width - margin * 2, height: maximumPanel - margin * 2 },
      'top',
    );
    const panelHeight = Math.min(
      maximumPanel,
      Math.max(format.height * 0.4, stackHeight(drafted) + margin * 2),
    );
    panelBox = {
      left: 0,
      top: format.height - panelHeight,
      width: format.width,
      height: panelHeight,
    };
    const free = panelHeight - margin * 2 - stackHeight(drafted);
    text = shiftElements(drafted, panelBox.top + margin + Math.max(0, free / 2));
  }
  const baseName =
    base.kind === 'image'
      ? 'Full bleed photo'
      : `${colorName((base as ShapeElement).colorId)} block`;
  return {
    id: 'photo-panel',
    name: `${baseName} with a ${colorName(panelId)} text panel`,
    scene: {
      formatId: format.id,
      backgroundId: 'white',
      elements: [base, block('panel-panel', panelId, panelBox), ...text, logo],
    },
  };
};

const cutInLayout = (context: LayoutContext): LayoutOption => {
  const { brief, format, choose, measure, margin } = context;
  const backgroundId = choose(['white', 'warm-white']);
  const landscape = isLandscape(format);
  const blockId = brief.photo ? null : choose(['navy', 'deep-teal', 'mc-blue']);
  const textLeft = landscape ? margin + format.width * 0.45 + margin : margin;
  const textWidth = landscape ? format.width - textLeft - margin : format.width - margin * 2;
  const logo = placeLogo(
    format,
    'horizontal',
    textLeft,
    format.height - margin - logoHeight(format, 'horizontal'),
    'cut-logo',
  );
  const textBottom = logo.top - margin;
  const stack = (top: number, height: number) =>
    buildTextStack({
      brief,
      format,
      box: { left: textLeft, top, width: textWidth, height },
      align: 'left',
      anchor: 'top',
      backdropId: backgroundId,
      preferences: LIGHT_TEXT,
      choose,
      measure,
      prefix: 'cut',
    });
  let cutBox: Box;
  let text: TextElement[];
  if (landscape) {
    cutBox = {
      left: margin,
      top: margin,
      width: format.width * 0.45,
      height: format.height - margin * 2,
    };
    text = stack(margin, textBottom - margin);
  } else {
    const drafted = stack(0, textBottom - margin * 3 - format.height * 0.25);
    const cutHeight = Math.max(
      format.height * 0.2,
      Math.min(format.height * 0.5, textBottom - stackHeight(drafted) - margin * 2),
    );
    cutBox = { left: margin, top: margin, width: format.width - margin * 2, height: cutHeight };
    text = shiftElements(drafted, cutBox.top + cutBox.height + margin);
  }
  const cutElements: SceneElement[] = [];
  if (brief.photo) {
    cutElements.push(photoElement('cut-photo', brief.photo, cutBox));
  } else if (blockId) {
    cutElements.push(block('cut-block', blockId, cutBox));
    const markHeight = Math.min(cutBox.height * 0.3, spacing(format, 64));
    cutElements.push(
      placeLogo(
        format,
        'monogram',
        cutBox.left + (cutBox.width - markHeight * LOGO_ASPECT.monogram) / 2,
        cutBox.top + (cutBox.height - markHeight) / 2,
        'cut-mark',
        markHeight,
      ),
    );
  }
  const cutName = blockId ? `${colorName(blockId)} block cut in` : 'Photo cut in';
  return {
    id: 'cut-in',
    name: `${cutName} on ${colorName(backgroundId)}`,
    scene: { formatId: format.id, backgroundId, elements: [...cutElements, ...text, logo] },
  };
};

const typeOnlyLayout = (context: LayoutContext): LayoutOption => {
  const { brief, format, choose, measure, margin } = context;
  const backgroundId = choose(['white', 'warm-white']);
  const logo = placeLogo(
    format,
    'horizontal',
    margin,
    format.height - margin - logoHeight(format, 'horizontal'),
    'type-logo',
  );
  const text = buildTextStack({
    brief,
    format,
    box: {
      left: margin,
      top: margin,
      width: format.width - margin * 2,
      height: logo.top - margin * 2,
    },
    align: 'left',
    anchor: 'bottom',
    backdropId: backgroundId,
    preferences: LIGHT_TEXT,
    choose,
    measure,
    prefix: 'type',
  });
  const elements: SceneElement[] = [...text, logo];
  return {
    id: 'type-only',
    name: `Type only on ${colorName(backgroundId)}, ${headlineColorName(elements)} headline`,
    scene: { formatId: format.id, backgroundId, elements },
  };
};

const centeredLayout = (context: LayoutContext): LayoutOption => {
  const { brief, format, choose, measure, margin } = context;
  const backgroundId = 'warm-white';
  const height = logoHeight(format, 'horizontal');
  const width = height * LOGO_ASPECT.horizontal;
  const logo = placeLogo(
    format,
    'horizontal',
    (format.width - width) / 2,
    format.height - margin - height,
    'centered-logo',
  );
  const text = buildTextStack({
    brief,
    format,
    box: {
      left: margin,
      top: margin,
      width: format.width - margin * 2,
      height: logo.top - margin * 2,
    },
    align: 'center',
    anchor: 'center',
    backdropId: backgroundId,
    preferences: { ...LIGHT_TEXT, headline: ['teal', 'black'] },
    choose,
    measure,
    prefix: 'centered',
  });
  const elements: SceneElement[] = [...text, logo];
  return {
    id: 'centered',
    name: `Warm White background, centered, ${headlineColorName(elements)} headline`,
    scene: { formatId: format.id, backgroundId, elements },
  };
};

const accentStripLayout = (context: LayoutContext): LayoutOption => {
  const { brief, format, choose, measure, margin } = context;
  const backgroundId = choose(['white', 'warm-white']);
  const stripId = choose(['mc-blue', 'yellow', 'navy', 'deep-teal']);
  const stripWidth = spacing(format, 14);
  const strip = block('strip-accent', stripId, {
    left: 0,
    top: 0,
    width: stripWidth,
    height: format.height,
  });
  const textLeft = stripWidth + margin;
  const logo = placeLogo(
    format,
    'horizontal',
    textLeft,
    format.height - margin - logoHeight(format, 'horizontal'),
    'strip-logo',
  );
  const text = buildTextStack({
    brief,
    format,
    box: {
      left: textLeft,
      top: margin,
      width: format.width - textLeft - margin,
      height: logo.top - margin * 2,
    },
    align: 'left',
    anchor: 'top',
    backdropId: backgroundId,
    preferences: LIGHT_TEXT,
    choose,
    measure,
    prefix: 'strip',
  });
  return {
    id: 'accent-strip',
    name: `${colorName(stripId)} accent strip on ${colorName(backgroundId)}`,
    scene: { formatId: format.id, backgroundId, elements: [strip, ...text, logo] },
  };
};

const LAYOUT_BUILDERS = [
  brandColorLayout,
  photoPanelLayout,
  cutInLayout,
  typeOnlyLayout,
  centeredLayout,
  accentStripLayout,
];

export const generateLayouts = (
  brief: Brief,
  seed: number,
  measure: MeasureText,
): LayoutOption[] => {
  const format = findFormat(brief.formatId);
  const margin = spacing(format, 24);
  return LAYOUT_BUILDERS.map((builder, index) =>
    builder({
      brief,
      format,
      choose: createChooser(seed * 31 + index * (seed ? 7 : 0)),
      measure,
      margin,
    }),
  );
};
