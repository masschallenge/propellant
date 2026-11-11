import { findColor } from '../brand/palette';
import { backdropFor, logoTreatment } from './guardrails';
import { PATTERN_COLOR_IDS, trianglePattern, type PatternId } from './patterns';
import {
  sceneFormat,
  textLines,
  type ImageElement,
  type LogoElement,
  type LogoTreatment,
  type LogoLockup,
  type Scene,
  type SceneElement,
  type ShapeElement,
  type TextElement,
} from './scene';
import type { MeasureText } from './text';
import { findTextRole, fontString, linePixels } from './typography';

export type DrawableImage = CanvasImageSource;

export type LogoKey = `${LogoLockup}-${LogoTreatment}`;

export interface RenderAssets {
  logos: Partial<Record<LogoKey, DrawableImage>>;
  photos: Record<string, DrawableImage | undefined>;
}

export interface RenderOptions {
  scale?: number;
  measure: MeasureText;
  belowElementId?: string;
  skipText?: boolean;
}

type Context = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

const drawText = (context: Context, element: TextElement, scene: Scene, measure: MeasureText) => {
  const format = sceneFormat(scene);
  const lines = textLines(element, format, measure);
  const lineHeight = linePixels(element.size, format);
  const anchors = { left: 0, center: element.width / 2, right: element.width };
  context.font = fontString(element.role, element.size, format);
  context.fillStyle = findColor(element.colorId).hex;
  context.textAlign = element.align;
  context.textBaseline = 'middle';
  lines.forEach((line, index) => {
    context.fillText(line, anchors[element.align], lineHeight * (index + 0.5));
  });
};

const drawImage = (context: Context, element: ImageElement, image: DrawableImage | undefined) => {
  context.save();
  context.beginPath();
  context.rect(0, 0, element.width, element.height);
  context.clip();
  if (image) {
    const coverScale =
      Math.max(element.width / element.naturalWidth, element.height / element.naturalHeight) *
      element.zoom;
    const drawnWidth = element.naturalWidth * coverScale;
    const drawnHeight = element.naturalHeight * coverScale;
    context.drawImage(
      image,
      (element.width - drawnWidth) / 2,
      (element.height - drawnHeight) / 2,
      drawnWidth,
      drawnHeight,
    );
  } else {
    context.fillStyle = findColor('slate').hex;
    context.fillRect(0, 0, element.width, element.height);
  }
  context.restore();
};

const drawShape = (context: Context, element: ShapeElement) => {
  context.fillStyle = findColor(element.colorId).hex;
  if (element.shape === 'circle') {
    context.beginPath();
    context.ellipse(
      element.width / 2,
      element.height / 2,
      element.width / 2,
      element.height / 2,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
    return;
  }
  context.fillRect(0, 0, element.width, element.height);
};

export const logoKeyFor = (scene: Scene, element: LogoElement): LogoKey =>
  `${element.lockup}-${logoTreatment(backdropFor(scene, element.id))}`;

export const missingLogoKeys = (scene: Scene, assets: RenderAssets): LogoKey[] => [
  ...new Set(
    scene.elements
      .filter((element): element is LogoElement => element.kind === 'logo' && !element.hidden)
      .map((element) => logoKeyFor(scene, element))
      .filter((key) => !assets.logos[key]),
  ),
];

const drawLogo = (context: Context, element: LogoElement, scene: Scene, assets: RenderAssets) => {
  const image = assets.logos[logoKeyFor(scene, element)];
  if (image) context.drawImage(image, 0, 0, element.width, element.height);
};

const drawPattern = (context: Context, pattern: PatternId, width: number, height: number) => {
  if (pattern !== 'triangles') return;
  context.fillStyle = findColor(PATTERN_COLOR_IDS[pattern][0]).hex;
  context.fillRect(0, 0, width, height);
  context.lineWidth = 1;
  trianglePattern(width, height).forEach((triangle) => {
    const hex = findColor(triangle.colorId).hex;
    context.fillStyle = hex;
    context.strokeStyle = hex;
    context.beginPath();
    context.moveTo(...triangle.points[0]);
    context.lineTo(...triangle.points[1]);
    context.lineTo(...triangle.points[2]);
    context.closePath();
    context.fill();
    context.stroke();
  });
};

const drawElement = (
  context: Context,
  element: SceneElement,
  scene: Scene,
  assets: RenderAssets,
  measure: MeasureText,
) => {
  context.save();
  context.globalAlpha = element.opacity;
  context.translate(element.left + element.width / 2, element.top + element.height / 2);
  if (element.rotation) context.rotate((element.rotation * Math.PI) / 180);
  context.translate(-element.width / 2, -element.height / 2);
  if (element.kind === 'text') drawText(context, element, scene, measure);
  if (element.kind === 'image') drawImage(context, element, assets.photos[element.photoId]);
  if (element.kind === 'shape') drawShape(context, element);
  if (element.kind === 'logo') drawLogo(context, element, scene, assets);
  context.restore();
};

export const renderScene = (
  context: Context,
  scene: Scene,
  assets: RenderAssets,
  options: RenderOptions,
) => {
  const format = sceneFormat(scene);
  const scale = options.scale ?? 1;
  context.save();
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.fillStyle = findColor(scene.backgroundId).hex;
  context.fillRect(0, 0, format.width, format.height);
  if (scene.pattern) drawPattern(context, scene.pattern, format.width, format.height);
  const stopIndex = options.belowElementId
    ? scene.elements.findIndex((element) => element.id === options.belowElementId)
    : scene.elements.length;
  scene.elements.slice(0, stopIndex < 0 ? scene.elements.length : stopIndex).forEach((element) => {
    if (element.hidden) return;
    if (options.skipText && element.kind === 'text') return;
    drawElement(context, element, scene, assets, options.measure);
  });
  context.restore();
};

export const textFontFaces = (): string[] =>
  (['headline', 'body', 'bold'] as const).map((roleId) => {
    const role = findTextRole(roleId);
    return `${role.weight} 40px ${role.family}`;
  });
