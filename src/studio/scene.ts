import { findFormat, type PostFormat } from './formats';
import { excerpt, wrapText, type MeasureText } from './text';
import {
  findTextRole,
  fontString,
  linePixels,
  type SizeStepId,
  type TextRoleId,
} from './typography';

export type TextAlign = 'left' | 'center' | 'right';
export type LogoLockup = 'horizontal' | 'monogram';
export type ShapeKind = 'block' | 'circle' | 'line';
export type LogoTreatment = 'color' | 'white' | 'black';

export interface ElementBase {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  hidden: boolean;
  locked: boolean;
}

export interface TextElement extends ElementBase {
  kind: 'text';
  role: TextRoleId;
  size: SizeStepId;
  colorId: string;
  align: TextAlign;
  text: string;
}

export interface LogoElement extends ElementBase {
  kind: 'logo';
  lockup: LogoLockup;
}

export interface ImageElement extends ElementBase {
  kind: 'image';
  photoId: string;
  naturalWidth: number;
  naturalHeight: number;
  zoom: number;
}

export interface ShapeElement extends ElementBase {
  kind: 'shape';
  shape: ShapeKind;
  colorId: string;
}

export type SceneElement = TextElement | LogoElement | ImageElement | ShapeElement;

export interface Scene {
  formatId: string;
  backgroundId: string;
  elements: SceneElement[];
}

export const LOGO_ASPECT: Record<LogoLockup, number> = {
  horizontal: 1671 / 225,
  monogram: 321 / 177,
};

export const LOGO_NAMES: Record<LogoLockup, string> = {
  horizontal: 'MassChallenge horizontal logo',
  monogram: 'MassChallenge monogram',
};

export const SHAPE_NAMES: Record<ShapeKind, string> = {
  block: 'Block',
  circle: 'Circle',
  line: 'Line',
};

export const BASE_DEFAULTS = {
  rotation: 0,
  opacity: 1,
  hidden: false,
  locked: false,
};

let idCounter = 0;

export const createElementId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
};

export const blankScene = (formatId: string): Scene => ({
  formatId,
  backgroundId: 'white',
  elements: [],
});

export const sceneFormat = (scene: Scene): PostFormat => findFormat(scene.formatId);

export const elementLabel = (element: SceneElement): string => {
  if (element.kind === 'text') {
    return `${findTextRole(element.role).roleName}: ${excerpt(element.text) || 'empty'}`;
  }
  if (element.kind === 'logo') return LOGO_NAMES[element.lockup];
  if (element.kind === 'image') return 'Photo';
  return SHAPE_NAMES[element.shape];
};

export const findElement = (scene: Scene, id: string | null): SceneElement | null =>
  scene.elements.find((element) => element.id === id) ?? null;

export const updateElement = <Patch extends Partial<SceneElement>>(
  scene: Scene,
  id: string,
  patch: Patch,
): Scene => ({
  ...scene,
  elements: scene.elements.map((element) =>
    element.id === id ? ({ ...element, ...patch } as SceneElement) : element,
  ),
});

export const replaceElement = (scene: Scene, next: SceneElement): Scene => ({
  ...scene,
  elements: scene.elements.map((element) => (element.id === next.id ? next : element)),
});

export const addElement = (scene: Scene, element: SceneElement): Scene => ({
  ...scene,
  elements: [...scene.elements, element],
});

export const removeElement = (scene: Scene, id: string): Scene => ({
  ...scene,
  elements: scene.elements.filter((element) => element.id !== id),
});

export type LayerDirection = 'up' | 'down' | 'top' | 'bottom';

export const moveLayer = (scene: Scene, id: string, direction: LayerDirection): Scene => {
  const index = scene.elements.findIndex((element) => element.id === id);
  if (index < 0) return scene;
  const remaining = scene.elements.filter((element) => element.id !== id);
  const targets: Record<LayerDirection, number> = {
    up: Math.min(index + 1, remaining.length),
    down: Math.max(index - 1, 0),
    top: remaining.length,
    bottom: 0,
  };
  const target = targets[direction];
  if (target === index) return scene;
  return {
    ...scene,
    elements: [...remaining.slice(0, target), scene.elements[index], ...remaining.slice(target)],
  };
};

export const displayText = (element: TextElement): string =>
  findTextRole(element.role).capitals === 'always' ? element.text.toUpperCase() : element.text;

export const textLines = (
  element: TextElement,
  format: PostFormat,
  measure: MeasureText,
): string[] =>
  wrapText(
    displayText(element),
    element.width,
    fontString(element.role, element.size, format),
    measure,
  );

export const layoutTextElement = (
  element: TextElement,
  format: PostFormat,
  measure: MeasureText,
): TextElement => {
  const height = textLines(element, format, measure).length * linePixels(element.size, format);
  return element.height === height ? element : { ...element, height };
};

export const layoutSceneText = (scene: Scene, measure: MeasureText): Scene => {
  const format = sceneFormat(scene);
  let changed = false;
  const elements = scene.elements.map((element) => {
    if (element.kind !== 'text') return element;
    const next = layoutTextElement(element, format, measure);
    if (next !== element) changed = true;
    return next;
  });
  return changed ? { ...scene, elements } : scene;
};

export const logoWidth = (lockup: LogoLockup, height: number): number =>
  height * LOGO_ASPECT[lockup];

export const centerOf = (element: ElementBase) => ({
  horizontal: element.left + element.width / 2,
  vertical: element.top + element.height / 2,
});
