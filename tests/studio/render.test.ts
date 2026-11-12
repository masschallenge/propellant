import { describe, expect, it } from 'vitest';
import { missingLogoKeys, renderScene } from '../../src/studio/render';
import { BASE_DEFAULTS, type Scene } from '../../src/studio/scene';
import { fakeMeasure } from './helpers';

const recordingContext = () => {
  const calls: { name: string; values: unknown[]; fillStyle?: unknown; font?: unknown }[] = [];
  const state: Record<string, unknown> = {};
  const context = new Proxy(state, {
    get: (target, property: string) => {
      if (property in target) return target[property];
      return (...values: unknown[]) => {
        calls.push({ name: property, values, fillStyle: target.fillStyle, font: target.font });
      };
    },
    set: (target, property: string, value) => {
      target[property] = value;
      return true;
    },
  });
  return { context: context as unknown as CanvasRenderingContext2D, calls };
};

const scene: Scene = {
  formatId: 'instagram-post',
  backgroundId: 'deep-teal',
  elements: [
    {
      ...BASE_DEFAULTS,
      id: 'headline',
      kind: 'text',
      role: 'headline',
      size: 'display',
      colorId: 'white',
      align: 'left',
      text: 'Demo day is here',
      left: 72,
      top: 72,
      width: 700,
      height: 264,
    },
    {
      ...BASE_DEFAULTS,
      id: 'logo',
      kind: 'logo',
      lockup: 'horizontal',
      left: 72,
      top: 1180,
      width: 668,
      height: 90,
    },
    {
      ...BASE_DEFAULTS,
      id: 'hidden',
      kind: 'shape',
      shape: 'circle',
      colorId: 'yellow',
      left: 0,
      top: 0,
      width: 10,
      height: 10,
      hidden: true,
    },
  ],
};

describe('renderScene', () => {
  it('paints the background, wraps text in capitals and picks the white logo on a dark background', () => {
    const { context, calls } = recordingContext();
    const whiteLogo = { kind: 'white-logo' } as unknown as CanvasImageSource;
    renderScene(
      context,
      scene,
      { logos: { 'horizontal-white': whiteLogo }, photos: {} },
      {
        measure: fakeMeasure,
        scale: 0.5,
      },
    );
    expect(calls[0]).toMatchObject({ name: 'save' });
    expect(calls.find((call) => call.name === 'setTransform')?.values).toEqual([
      0.5, 0, 0, 0.5, 0, 0,
    ]);
    expect(calls.find((call) => call.name === 'fillRect')?.fillStyle).toBe('#004F73');
    const lines = calls.filter((call) => call.name === 'fillText');
    expect(lines.map((call) => call.values[0])).toEqual(['DEMO DAY', 'IS HERE']);
    expect(String(lines[0].font)).toContain('Oswald');
    const logo = calls.find((call) => call.name === 'drawImage');
    expect(logo?.values[0]).toBe(whiteLogo);
    expect(calls.some((call) => call.name === 'ellipse')).toBe(false);
  });

  it('can stop below an element and skip text for measuring', () => {
    const { context, calls } = recordingContext();
    renderScene(
      context,
      scene,
      { logos: {}, photos: {} },
      {
        measure: fakeMeasure,
        belowElementId: 'logo',
        skipText: true,
      },
    );
    expect(calls.some((call) => call.name === 'fillText')).toBe(false);
  });
});

describe('missingLogoKeys', () => {
  const logoScene: Scene = {
    formatId: 'instagram-post',
    backgroundId: 'deep-teal',
    elements: [
      {
        ...BASE_DEFAULTS,
        id: 'logo',
        kind: 'logo',
        lockup: 'horizontal',
        left: 72,
        top: 1100,
        height: 90,
        width: 90 * (1671 / 225),
      },
    ],
  };

  it('names the logo image the scene still needs before it can be exported', () => {
    expect(missingLogoKeys(logoScene, { logos: {}, photos: {} })).toEqual(['horizontal-white']);
  });

  it('is empty once that image has loaded, and ignores hidden logos', () => {
    const image = { width: 1, height: 1 } as unknown as HTMLImageElement;
    expect(
      missingLogoKeys(logoScene, { logos: { 'horizontal-white': image }, photos: {} }),
    ).toEqual([]);
    const hidden = { ...logoScene, elements: [{ ...logoScene.elements[0], hidden: true }] };
    expect(missingLogoKeys(hidden, { logos: {}, photos: {} })).toEqual([]);
  });
});
