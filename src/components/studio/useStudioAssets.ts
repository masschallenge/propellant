import { useEffect, useMemo, useState } from 'react';
import { createCanvasMeasure, loadImage, waitForFonts } from '../../studio/canvas';
import { applyHeroOverlay } from '../../brand/imagery';
import type { LogoKey, RenderAssets } from '../../studio/render';
import { LOGO_URLS } from './assets';

export interface PhotoAsset {
  id: string;
  name: string;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
  hasOverlay?: boolean;
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

export interface LogoImages {
  logos: RenderAssets['logos'];
  error: string | null;
}

export const LOGO_LOAD_ERROR =
  'The MassChallenge logo could not be loaded, so posts cannot include it. Reload the page to try again.';

export const useLogoImages = (): LogoImages => {
  const [logos, setLogos] = useState<RenderAssets['logos']>({});
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let isActive = true;
    const entries = Object.entries(LOGO_URLS) as [LogoKey, string][];
    Promise.all(entries.map(async ([key, url]) => [key, await loadImage(url)] as const))
      .then((pairs) => {
        if (isActive) setLogos(Object.fromEntries(pairs));
      })
      .catch(() => {
        if (isActive) setError(LOGO_LOAD_ERROR);
      });
    return () => {
      isActive = false;
    };
  }, []);
  return { logos, error };
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

const OVERLAY_MAXIMUM_SIDE = 2400;

export const overlayId = (photoId: string) => `${photoId}-overlay`;

export const makeOverlayPhoto = async (photo: PhotoAsset): Promise<PhotoAsset> => {
  const scale = Math.min(1, OVERLAY_MAXIMUM_SIDE / Math.max(photo.width, photo.height));
  const width = Math.max(1, Math.round(photo.width * scale));
  const height = Math.max(1, Math.round(photo.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('This browser cannot add the hero overlay.');
  context.drawImage(photo.image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  applyHeroOverlay(imageData.data, width, height, 'left');
  context.putImageData(imageData, 0, 0);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) =>
        result ? resolve(result) : reject(new Error('The hero overlay could not be added.')),
      'image/png',
    ),
  );
  const url = URL.createObjectURL(blob);
  const image = await loadImage(url);
  return {
    id: overlayId(photo.id),
    name: `${photo.name} (hero overlay)`,
    url,
    image,
    width,
    height,
    hasOverlay: true,
  };
};
