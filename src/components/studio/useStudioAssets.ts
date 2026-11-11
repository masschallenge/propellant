import { useEffect, useMemo, useState } from 'react';
import { createCanvasMeasure, loadImage, waitForFonts } from '../../studio/canvas';
import { duotonePixels } from '../../studio/patterns';
import type { LogoKey, RenderAssets } from '../../studio/render';
import { LOGO_URLS } from './assets';

export interface PhotoAsset {
  id: string;
  name: string;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
  isDuotone?: boolean;
}

export const useFontsReady = (): boolean => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let isActive = true;
    waitForFonts().finally(() => {
      if (isActive) setIsReady(true);
    });
    return () => {
      isActive = false;
    };
  }, []);
  return isReady;
};

export const useLogoImages = (): RenderAssets['logos'] => {
  const [logos, setLogos] = useState<RenderAssets['logos']>({});
  useEffect(() => {
    let isActive = true;
    const entries = Object.entries(LOGO_URLS) as [LogoKey, string][];
    Promise.all(entries.map(async ([key, url]) => [key, await loadImage(url)] as const))
      .then((pairs) => {
        if (isActive) setLogos(Object.fromEntries(pairs));
      })
      .catch(() => undefined);
    return () => {
      isActive = false;
    };
  }, []);
  return logos;
};

export const useMeasure = (fontsReady: boolean) =>
  useMemo(() => createCanvasMeasure(), [fontsReady]);

let photoCounter = 0;

export const readPhoto = async (file: File): Promise<PhotoAsset> => {
  if (!file.type.startsWith('image/')) throw new Error('That file is not an image.');
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    photoCounter += 1;
    return {
      id: `photo-${photoCounter}`,
      name: file.name,
      url,
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};

const DUOTONE_MAXIMUM_SIDE = 2400;

export const duotoneId = (photoId: string) => `${photoId}-duotone`;

export const makeDuotonePhoto = async (photo: PhotoAsset): Promise<PhotoAsset> => {
  const scale = Math.min(1, DUOTONE_MAXIMUM_SIDE / Math.max(photo.width, photo.height));
  const width = Math.max(1, Math.round(photo.width * scale));
  const height = Math.max(1, Math.round(photo.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('This browser cannot make a duotone.');
  context.drawImage(photo.image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  imageData.data.set(duotonePixels(imageData.data));
  context.putImageData(imageData, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('The duotone could not be made.'))),
      'image/png',
    ),
  );
  const url = URL.createObjectURL(blob);
  const image = await loadImage(url);
  return {
    id: duotoneId(photo.id),
    name: `${photo.name} (teal duotone)`,
    url,
    image,
    width,
    height,
    isDuotone: true,
  };
};
