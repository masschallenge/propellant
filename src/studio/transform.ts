import type { PostFormat } from './formats';
import { constrainLogo } from './guardrails';
import { LOGO_ASPECT, layoutTextElement, type SceneElement } from './scene';
import type { MeasureText } from './text';
import { canvasScale } from './typography';

export type HandleId = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';

export const handlesFor = (element: SceneElement): HandleId[] => {
  if (element.kind === 'text') return ['left', 'right'];
  if (element.kind === 'shape' && element.shape === 'line') return ['left', 'right'];
  if (element.kind === 'shape')
    return ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'left', 'right'];
  return ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
};

const minimumSide = (format: PostFormat) => 8 * canvasScale(format);

export const moveElement = (
  element: SceneElement,
  deltaX: number,
  deltaY: number,
  format: PostFormat,
): SceneElement => {
  const moved = { ...element, left: element.left + deltaX, top: element.top + deltaY };
  return moved.kind === 'logo' ? constrainLogo(moved, format) : moved;
};

const growsLeft = (handle: HandleId) => handle === 'left' || handle.endsWith('-left');
const growsUp = (handle: HandleId) => handle.startsWith('top');

export const resizeElement = (
  element: SceneElement,
  handle: HandleId,
  deltaX: number,
  deltaY: number,
  format: PostFormat,
  measure: MeasureText,
): SceneElement => {
  const minimum = minimumSide(format);
  const widthChange = growsLeft(handle) ? -deltaX : deltaX;
  const smallest = element.kind === 'logo' ? 1 : minimum * 4;
  const width = Math.max(smallest, element.width + widthChange);
  const right = element.left + element.width;
  const bottom = element.top + element.height;
  const left = growsLeft(handle) ? right - width : element.left;
  if (element.kind === 'text') {
    return layoutTextElement({ ...element, width, left }, format, measure);
  }
  if (element.kind === 'shape' && element.shape === 'line') {
    return { ...element, width, left };
  }
  const isCorner = handle.includes('-');
  if (element.kind === 'logo' || (element.kind === 'image' && isCorner)) {
    const ratio =
      element.kind === 'logo' ? LOGO_ASPECT[element.lockup] : element.width / element.height;
    const height = width / ratio;
    const top = growsUp(handle) ? bottom - height : element.top;
    const resized = { ...element, width, height, left, top };
    return resized.kind === 'logo' ? constrainLogo(resized, format) : resized;
  }
  if (!isCorner) return { ...element, width, left };
  const heightChange = growsUp(handle) ? -deltaY : deltaY;
  const height = Math.max(minimum, element.height + heightChange);
  const top = growsUp(handle) ? bottom - height : element.top;
  return { ...element, width, height, left, top };
};

export const NUDGE_UNITS = 2;
export const LARGE_NUDGE_UNITS = 10;

export const nudgeDistance = (format: PostFormat, isLarge: boolean): number =>
  (isLarge ? LARGE_NUDGE_UNITS : NUDGE_UNITS) * canvasScale(format);

export const scaleAroundCenter = (
  element: SceneElement,
  width: number,
  height: number,
): SceneElement => ({
  ...element,
  width,
  height,
  left: element.left + (element.width - width) / 2,
  top: element.top + (element.height - height) / 2,
});
