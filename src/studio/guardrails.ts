import { BRAND_COLORS, findColor, type BrandColor } from '../brand/palette';
import { contrastRatio, isDark, relativeLuminance } from '../brand/contrast';
import { LOGO_GRAY, textReservation } from './colorRules';
import { PATTERN_NAMES, patternColors, type PatternId } from './patterns';
import type { PostFormat } from './formats';
import {
  LOGO_ASPECT,
  displayText,
  sceneFormat,
  type LogoElement,
  type LogoLockup,
  type LogoTreatment,
  type Scene,
  type SceneElement,
  type TextElement,
} from './scene';
import { excerpt, isAllCaps, toSentenceCase } from './text';
import {
  canvasScale,
  findSizeStep,
  findTextRole,
  isLargeText,
  isSizeAllowed,
  requiredContrast,
  type SizeStepId,
  type TextRoleId,
} from './typography';

export type Backdrop =
  | { kind: 'color'; color: BrandColor; elementId: string | null }
  | { kind: 'photo'; elementId: string }
  | { kind: 'pattern'; pattern: PatternId; colors: BrandColor[]; elementId: null };

export type PixelSamples = ArrayLike<number>;

export type SampleMap = Record<string, PixelSamples | undefined>;

const containsPoint = (element: SceneElement, horizontal: number, vertical: number): boolean => {
  if (element.kind === 'shape' && element.shape === 'circle') {
    const radiusX = element.width / 2;
    const radiusY = element.height / 2;
    if (!radiusX || !radiusY) return false;
    const offsetX = (horizontal - (element.left + radiusX)) / radiusX;
    const offsetY = (vertical - (element.top + radiusY)) / radiusY;
    return offsetX * offsetX + offsetY * offsetY <= 1;
  }
  return (
    horizontal >= element.left &&
    horizontal <= element.left + element.width &&
    vertical >= element.top &&
    vertical <= element.top + element.height
  );
};

const canBeBackdrop = (element: SceneElement): boolean =>
  !element.hidden &&
  (element.kind === 'image' || (element.kind === 'shape' && element.shape !== 'line'));

export const backdropFor = (scene: Scene, elementId: string): Backdrop => {
  const index = scene.elements.findIndex((element) => element.id === elementId);
  const target = scene.elements[index];
  const background: Backdrop = scene.pattern
    ? {
        kind: 'pattern',
        pattern: scene.pattern,
        colors: patternColors(scene.pattern),
        elementId: null,
      }
    : {
        kind: 'color',
        color: findColor(scene.backgroundId),
        elementId: null,
      };
  if (!target) return background;
  const horizontal = target.left + target.width / 2;
  const vertical = target.top + target.height / 2;
  const below = scene.elements.slice(0, index).reverse();
  const cover = below.find(
    (candidate) => canBeBackdrop(candidate) && containsPoint(candidate, horizontal, vertical),
  );
  if (!cover) return background;
  if (cover.kind === 'image') return { kind: 'photo', elementId: cover.id };
  if (cover.kind === 'shape') {
    return { kind: 'color', color: findColor(cover.colorId), elementId: cover.id };
  }
  return background;
};

export const backdropName = (backdrop: Backdrop): string => {
  if (backdrop.kind === 'photo') return 'Photo';
  if (backdrop.kind === 'pattern') return PATTERN_NAMES[backdrop.pattern];
  return backdrop.color.name;
};

export const lowestRatio = (hex: string, colors: BrandColor[]): number =>
  Math.min(...colors.map((color) => contrastRatio(hex, color.hex)));

export const formatRatio = (ratio: number): string =>
  `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`;

export const PHOTO_PERCENTILE = 0.1;

export const measuredContrast = (hex: string, pixels: PixelSamples): number | null => {
  const textLuminance = relativeLuminance(hex);
  const ratios: number[] = [];
  for (let offset = 0; offset + 3 < pixels.length; offset += 4) {
    if (pixels[offset + 3] === 0) continue;
    const pixelHex = `#${[pixels[offset], pixels[offset + 1], pixels[offset + 2]]
      .map((channel) => Math.round(channel).toString(16).padStart(2, '0'))
      .join('')}`;
    const pixelLuminance = relativeLuminance(pixelHex);
    const lighter = Math.max(textLuminance, pixelLuminance);
    const darker = Math.min(textLuminance, pixelLuminance);
    ratios.push((lighter + 0.05) / (darker + 0.05));
  }
  if (!ratios.length) return null;
  ratios.sort((first, second) => first - second);
  return ratios[Math.floor(ratios.length * PHOTO_PERCENTILE)];
};

export interface TextColorOption {
  color: BrandColor;
  ratio: number | null;
  allowed: boolean;
  reason: string | null;
}

const sizeWords = (roleId: TextRoleId, sizeId: SizeStepId): string =>
  isLargeText(roleId, sizeId) ? 'Large text' : 'Text this size';

export const backdropRatio = (
  hex: string,
  backdrop: Backdrop,
  samples?: PixelSamples,
): number | null => {
  if (backdrop.kind === 'color') return contrastRatio(hex, backdrop.color.hex);
  if (backdrop.kind === 'pattern') return lowestRatio(hex, backdrop.colors);
  return samples ? measuredContrast(hex, samples) : null;
};

export const textColorOptions = (
  backdrop: Backdrop,
  roleId: TextRoleId,
  sizeId: SizeStepId,
  samples?: PixelSamples,
): TextColorOption[] => {
  const required = requiredContrast(roleId, sizeId);
  return BRAND_COLORS.map((color) => {
    const ratio = backdropRatio(color.hex, backdrop, samples);
    const reservation = textReservation(color.id);
    if (reservation) return { color, ratio, allowed: false, reason: reservation };
    if (ratio !== null && ratio < required) {
      const measured =
        backdrop.kind === 'photo' ? 'measured on the photo' : `on ${backdropName(backdrop)}`;
      return {
        color,
        ratio,
        allowed: false,
        reason: `Only ${formatRatio(ratio)} ${measured}. ${sizeWords(roleId, sizeId)} needs ${required}:1.`,
      };
    }
    return { color, ratio, allowed: true, reason: null };
  });
};

export const mostReadableOption = (options: TextColorOption[]): TextColorOption => {
  const allowed = options.filter((option) => option.allowed);
  const pool = allowed.length
    ? allowed
    : options.filter((option) => !textReservation(option.color.id));
  return pool.reduce((best, option) => ((option.ratio ?? 0) > (best.ratio ?? 0) ? option : best));
};

export interface CaseResult {
  text: string;
  changed: boolean;
}

export const applyCaseRule = (roleId: TextRoleId, text: string): CaseResult => {
  const role = findTextRole(roleId);
  if (role.capitals === 'always') {
    const upper = text.toUpperCase();
    return { text: upper, changed: upper !== text };
  }
  if (isAllCaps(text)) return { text: toSentenceCase(text), changed: true };
  return { text, changed: false };
};

export const caseMessage = (before: string): string =>
  `Body text is never all caps, so "${excerpt(before)}" is now in sentence case. Capitals belong only to Oswald headlines.`;

export interface ColorSwitch {
  elementId: string;
  text: string;
  colorName: string;
}

export const switchMessage = (colorSwitch: ColorSwitch): string =>
  `Switched "${excerpt(colorSwitch.text)}" to ${colorSwitch.colorName} so it reads on that background`;

export const optionsForText = (
  scene: Scene,
  element: TextElement,
  samples: SampleMap,
): TextColorOption[] => {
  const backdrop = backdropFor(scene, element.id);
  return textColorOptions(backdrop, element.role, element.size, samples[element.id]);
};

export const enforceTextColors = (
  scene: Scene,
  samples: SampleMap = {},
): { scene: Scene; switches: ColorSwitch[] } => {
  const switches: ColorSwitch[] = [];
  const elements = scene.elements.map((element) => {
    if (element.kind !== 'text' || element.hidden) return element;
    const options = optionsForText(scene, element, samples);
    const current = options.find((option) => option.color.id === element.colorId);
    if (current?.allowed) return element;
    const best = mostReadableOption(options);
    if (best.color.id === element.colorId) return element;
    switches.push({
      elementId: element.id,
      text: displayText(element),
      colorName: best.color.name,
    });
    return { ...element, colorId: best.color.id };
  });
  return { scene: switches.length ? { ...scene, elements } : scene, switches };
};

export const MINIMUM_LOGO_PIXELS: Record<LogoLockup, number> = {
  horizontal: 24,
  monogram: 16,
};

export const MINIMUM_GRAPHIC_CONTRAST = 3;

const TREATMENT_HEXES: Record<LogoTreatment, string> = {
  color: LOGO_GRAY,
  white: '#FFFFFF',
  black: '#000000',
};

export const logoTreatment = (backdrop: Backdrop): LogoTreatment => {
  if (backdrop.kind === 'photo') return 'white';
  if (backdrop.kind === 'pattern') {
    const treatments: LogoTreatment[] = ['color', 'white', 'black'];
    return (
      treatments.find(
        (treatment) =>
          lowestRatio(TREATMENT_HEXES[treatment], backdrop.colors) >= MINIMUM_GRAPHIC_CONTRAST,
      ) ?? 'black'
    );
  }
  if (isDark(backdrop.color.hex)) return 'white';
  return contrastRatio(LOGO_GRAY, backdrop.color.hex) >= MINIMUM_GRAPHIC_CONTRAST
    ? 'color'
    : 'black';
};

export const TREATMENT_NAMES: Record<LogoTreatment, string> = {
  color: 'Full color',
  white: 'White',
  black: 'Black',
};

export const logoMinimumHeight = (lockup: LogoLockup, format: PostFormat): number =>
  MINIMUM_LOGO_PIXELS[lockup] * canvasScale(format);

export const logoClearSpace = (height: number): number => height / 2;

export const logoMaximumHeight = (lockup: LogoLockup, format: PostFormat): number =>
  Math.min(format.width / (LOGO_ASPECT[lockup] + 1), format.height / 2);

export const constrainLogo = (element: LogoElement, format: PostFormat): LogoElement => {
  const height = Math.min(
    Math.max(element.height, logoMinimumHeight(element.lockup, format)),
    logoMaximumHeight(element.lockup, format),
  );
  const width = height * LOGO_ASPECT[element.lockup];
  const clear = logoClearSpace(height);
  const left = Math.min(Math.max(element.left, clear), format.width - clear - width);
  const top = Math.min(Math.max(element.top, clear), format.height - clear - height);
  return { ...element, height, width, left, top, rotation: 0, opacity: 1 };
};

export const constrainSceneLogos = (scene: Scene): Scene => {
  const format = sceneFormat(scene);
  return {
    ...scene,
    elements: scene.elements.map((element) =>
      element.kind === 'logo' ? constrainLogo(element, format) : element,
    ),
  };
};

export interface BrandIssue {
  elementId: string | null;
  message: string;
}

const EDGE_TOLERANCE = 1;

const textIssues = (scene: Scene, element: TextElement, samples: SampleMap): BrandIssue[] => {
  const format = sceneFormat(scene);
  const role = findTextRole(element.role);
  const name = `"${excerpt(displayText(element), 28)}"`;
  const issues: BrandIssue[] = [];
  if (role.capitals === 'never' && isAllCaps(element.text)) {
    issues.push({ elementId: element.id, message: `${name} is body text in all caps.` });
  }
  if (!isSizeAllowed(element.role, element.size)) {
    issues.push({
      elementId: element.id,
      message: `${name} uses ${findSizeStep(element.size).name}, which ${role.fontName} does not use.`,
    });
  }
  const reservation = textReservation(element.colorId);
  if (reservation) {
    issues.push({ elementId: element.id, message: `${name}: ${reservation}` });
  } else {
    const backdrop = backdropFor(scene, element.id);
    const ratio = backdropRatio(findColor(element.colorId).hex, backdrop, samples[element.id]);
    const required = requiredContrast(element.role, element.size);
    if (ratio !== null && ratio < required) {
      const where =
        backdrop.kind === 'photo' ? 'measured on the photo' : `on ${backdropName(backdrop)}`;
      issues.push({
        elementId: element.id,
        message: `${name} is ${formatRatio(ratio)} ${where}, it needs ${required}:1.`,
      });
    }
  }
  if (
    element.left < -EDGE_TOLERANCE ||
    element.top < -EDGE_TOLERANCE ||
    element.left + element.width > format.width + EDGE_TOLERANCE ||
    element.top + element.height > format.height + EDGE_TOLERANCE
  ) {
    issues.push({ elementId: element.id, message: `${name} runs off the edge of the canvas.` });
  }
  return issues;
};

const logoIssues = (scene: Scene, element: LogoElement, samples: SampleMap): BrandIssue[] => {
  const format = sceneFormat(scene);
  const issues: BrandIssue[] = [];
  const minimum = logoMinimumHeight(element.lockup, format);
  const label = element.lockup === 'horizontal' ? 'The horizontal logo' : 'The monogram';
  if (element.height < minimum - EDGE_TOLERANCE) {
    issues.push({
      elementId: element.id,
      message: `${label} is below its minimum size of ${MINIMUM_LOGO_PIXELS[element.lockup]}px.`,
    });
  }
  const clear = logoClearSpace(element.height);
  if (
    element.left < clear - EDGE_TOLERANCE ||
    element.top < clear - EDGE_TOLERANCE ||
    element.left + element.width > format.width - clear + EDGE_TOLERANCE ||
    element.top + element.height > format.height - clear + EDGE_TOLERANCE
  ) {
    issues.push({
      elementId: element.id,
      message: `${label} is inside its clear space: keep half its height from the edge.`,
    });
  }
  if (element.rotation !== 0 || element.opacity !== 1) {
    issues.push({ elementId: element.id, message: `${label} is rotated or faded.` });
  }
  const backdrop = backdropFor(scene, element.id);
  const elementSamples = samples[element.id];
  if (backdrop.kind === 'photo' && elementSamples) {
    const ratio = measuredContrast('#FFFFFF', elementSamples);
    if (ratio !== null && ratio < MINIMUM_GRAPHIC_CONTRAST) {
      issues.push({
        elementId: element.id,
        message: `The photo behind the logo is too light for the white logo (${formatRatio(ratio)}).`,
      });
    }
  }
  return issues;
};

export const checkScene = (scene: Scene, samples: SampleMap = {}): BrandIssue[] =>
  scene.elements.flatMap((element) => {
    if (element.hidden) return [];
    if (element.kind === 'text') return textIssues(scene, element, samples);
    if (element.kind === 'logo') return logoIssues(scene, element, samples);
    return [];
  });

export const needsMeasuring = (scene: Scene, element: SceneElement): boolean =>
  !element.hidden &&
  (element.kind === 'text' || element.kind === 'logo') &&
  backdropFor(scene, element.id).kind === 'photo';
