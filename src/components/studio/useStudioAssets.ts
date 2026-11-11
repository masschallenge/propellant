import { useEffect, useMemo, useState } from 'react';
import { createCanvasMeasure, loadImage, waitForFonts } from '../../studio/canvas';
import type { LogoKey, RenderAssets } from '../../studio/render';
import { LOGO_URLS } from './assets';

export interface PhotoAsset {
  id: string;
  name: string;
  url: string;
  image: HTMLImageElement;
  width: number;
  height: number;
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
