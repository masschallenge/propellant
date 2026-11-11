import { findFormat, type PostFormat } from './formats';
import { constrainSceneLogos } from './guardrails';
import { layoutTextElement, logoWidth, sceneFormat, type Scene, type SceneElement } from './scene';
import type { MeasureText } from './text';
import { canvasScale } from './typography';

const coversCanvas = (element: SceneElement, format: PostFormat): boolean =>
  element.left <= 1 &&
  element.top <= 1 &&
  element.left + element.width >= format.width - 1 &&
  element.top + element.height >= format.height - 1;

export const reflowScene = (scene: Scene, formatId: string, measure: MeasureText): Scene => {
  const from = sceneFormat(scene);
  const to = findFormat(formatId);
  if (from.id === to.id) return scene;
  const scaleX = to.width / from.width;
  const scaleY = to.height / from.height;
  const scaleType = canvasScale(to) / canvasScale(from);
  const elements = scene.elements.map((element): SceneElement => {
    if (coversCanvas(element, from)) {
      return { ...element, left: 0, top: 0, width: to.width, height: to.height };
    }
    const centerX = (element.left + element.width / 2) * scaleX;
    const centerY = (element.top + element.height / 2) * scaleY;
    if (element.kind === 'logo') {
      const height = element.height * scaleType;
      const width = logoWidth(element.lockup, height);
      return { ...element, height, width, left: centerX - width / 2, top: centerY - height / 2 };
    }
    if (element.kind === 'text') {
      const width = Math.min(element.width * scaleX, to.width);
      const laidOut = layoutTextElement(
        { ...element, width, left: element.left * scaleX, top: element.top * scaleY },
        to,
        measure,
      );
      const top = Math.max(0, Math.min(laidOut.top, to.height - laidOut.height));
      return { ...laidOut, top };
    }
    const width = element.width * scaleX;
    const height =
      element.kind === 'shape' && element.shape === 'line'
        ? element.height * scaleType
        : element.height * scaleY;
    return { ...element, width, height, left: centerX - width / 2, top: centerY - height / 2 };
  });
  return constrainSceneLogos({ ...scene, formatId, elements });
};
