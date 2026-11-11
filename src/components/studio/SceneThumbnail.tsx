import { useEffect, useRef } from 'react';
import { renderScene, type RenderAssets } from '../../studio/render';
import { sceneFormat, type Scene } from '../../studio/scene';
import type { MeasureText } from '../../studio/text';

interface SceneThumbnailProps {
  scene: Scene;
  assets: RenderAssets;
  measure: MeasureText;
  width: number;
}

export const SceneThumbnail = ({ scene, assets, measure, width }: SceneThumbnailProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const format = sceneFormat(scene);
  const height = (width * format.height) / format.width;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    const context = canvas.getContext('2d');
    if (!context) return;
    renderScene(context, scene, assets, { measure, scale: (width * pixelRatio) / format.width });
  }, [scene, assets, measure, width, height, format.width]);
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="block max-w-full rounded-[var(--corner-sm)] shadow-[var(--shadow-float)]"
      style={{ width, height: 'auto', aspectRatio: `${format.width} / ${format.height}` }}
    />
  );
};
