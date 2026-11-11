import { needsMeasuring, type SampleMap } from './guardrails';
import { missingLogoKeys, renderScene, textFontFaces, type RenderAssets } from './render';
import { sceneFormat, type Scene } from './scene';
import { fileNameFromLine, type MeasureText } from './text';

export const createCanvasMeasure = (): MeasureText => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const cache = new Map<string, number>();
  return (text, font) => {
    const key = `${font}|${text}`;
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    if (!context) return text.length * 10;
    context.font = font;
    const width = context.measureText(text).width;
    cache.set(key, width);
    return width;
  };
};

export const waitForFonts = async (): Promise<void> => {
  if (!('fonts' in document)) return;
  await Promise.all(textFontFaces().map((face) => document.fonts.load(face).catch(() => [])));
  await document.fonts.ready;
};

const SAMPLE_SCALE = 0.25;

export const sampleBackdrops = (
  scene: Scene,
  assets: RenderAssets,
  measure: MeasureText,
): SampleMap => {
  const format = sceneFormat(scene);
  const samples: SampleMap = {};
  scene.elements.forEach((element) => {
    if (!needsMeasuring(scene, element)) return;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(format.width * SAMPLE_SCALE));
    canvas.height = Math.max(1, Math.round(format.height * SAMPLE_SCALE));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;
    renderScene(context, scene, assets, {
      measure,
      scale: SAMPLE_SCALE,
      belowElementId: element.id,
    });
    const left = Math.max(0, Math.floor(element.left * SAMPLE_SCALE));
    const top = Math.max(0, Math.floor(element.top * SAMPLE_SCALE));
    const right = Math.min(canvas.width, Math.ceil((element.left + element.width) * SAMPLE_SCALE));
    const bottom = Math.min(
      canvas.height,
      Math.ceil((element.top + element.height) * SAMPLE_SCALE),
    );
    if (right <= left || bottom <= top) return;
    try {
      samples[element.id] = context.getImageData(left, top, right - left, bottom - top).data;
    } catch {
      return;
    }
  });
  return samples;
};

export const renderSceneToBlob = async (
  scene: Scene,
  assets: RenderAssets,
  measure: MeasureText,
): Promise<Blob> => {
  await waitForFonts();
  if (missingLogoKeys(scene, assets).length) {
    throw new Error(
      'The MassChallenge logo has not finished loading. Wait a moment and try again.',
    );
  }
  const format = sceneFormat(scene);
  const canvas = document.createElement('canvas');
  canvas.width = format.width;
  canvas.height = format.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser cannot draw the post.');
  renderScene(context, scene, assets, { measure, scale: 1 });
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('The PNG could not be made.'))),
      'image/png',
    ),
  );
};

export const downloadBlob = (blob: Blob, line: string): string => {
  const fileName = fileNameFromLine(line);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return fileName;
};

export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The image could not be read.'));
    image.src = url;
  });
