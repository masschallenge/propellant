import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/brand/contrast';
import { findColor } from '../../src/brand/palette';
import { findFormat } from '../../src/studio/formats';
import {
  applyCaseRule,
  backdropFor,
  caseMessage,
  checkScene,
  constrainLogo,
  enforceTextColors,
  logoMinimumHeight,
  logoTreatment,
  measuredContrast,
  switchMessage,
  textColorOptions,
} from '../../src/studio/guardrails';
import {
  BASE_DEFAULTS,
  type LogoElement,
  type Scene,
  type TextElement,
} from '../../src/studio/scene';

const headline = (patch: Partial<TextElement> = {}): TextElement => ({
  ...BASE_DEFAULTS,
  id: 'headline',
  kind: 'text',
  role: 'headline',
  size: 'display',
  colorId: 'white',
  align: 'left',
  text: 'DEMO DAY',
  left: 100,
  top: 100,
  width: 800,
  height: 132,
  ...patch,
});

const body = (patch: Partial<TextElement> = {}): TextElement =>
  headline({ id: 'body', role: 'body', size: 'body', text: "Don't miss out", ...patch });

const logo = (patch: Partial<LogoElement> = {}): LogoElement => ({
  ...BASE_DEFAULTS,
  id: 'logo',
  kind: 'logo',
  lockup: 'horizontal',
  left: 72,
  top: 1100,
  height: 90,
  width: 90 * (1671 / 225),
  ...patch,
});

const deepTeal = { kind: 'color' as const, color: findColor('deep-teal'), elementId: null };

const pixelsOf = (hex: string, count: number) => {
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  return Array.from({ length: count }).flatMap(() => [red, green, blue, 255]);
};

describe('case rule', () => {
  it('turns all caps body text into sentence case', () => {
    expect(applyCaseRule('body', "DON'T MISS OUT")).toEqual({
      text: "Don't miss out",
      changed: true,
    });
    expect(applyCaseRule('bold', 'Apply now')).toEqual({ text: 'Apply now', changed: false });
    expect(caseMessage("DON'T MISS OUT")).toContain('sentence case');
  });

  it('forces Oswald to capitals', () => {
    expect(applyCaseRule('headline', 'Demo day')).toEqual({ text: 'DEMO DAY', changed: true });
  });
});

describe('text colors', () => {
  it('offers only colors that pass on the background, and says why the rest do not', () => {
    const options = textColorOptions(deepTeal, 'body', 'body');
    const byId = Object.fromEntries(options.map((option) => [option.color.id, option]));
    expect(byId.white.allowed).toBe(true);
    expect(byId.ink.allowed).toBe(false);
    expect(byId.ink.reason).toMatch(/^Only 1\.\d:1 on Deep teal\. Text this size needs 4\.5:1\.$/);
    expect(byId['bright-teal'].allowed).toBe(false);
    expect(byId.teal.reason).toContain('act on something');
    options
      .filter((option) => option.allowed)
      .forEach((option) =>
        expect(contrastRatio(option.color.hex, '#044451')).toBeGreaterThanOrEqual(4.5),
      );
  });

  it('lets large headlines use 3:1', () => {
    const options = textColorOptions(deepTeal, 'headline', 'display');
    expect(options.find((option) => option.color.id === 'bright-teal')?.allowed).toBe(true);
  });

  it('measures the photo under the text', () => {
    const darkPhoto = pixelsOf('#101010', 90).concat(pixelsOf('#F0F0F0', 10));
    expect(measuredContrast('#FFFFFF', darkPhoto)).toBeGreaterThan(15);
    const lightPhoto = pixelsOf('#F0F0F0', 100);
    expect(measuredContrast('#FFFFFF', lightPhoto)).toBeLessThan(1.2);
    expect(measuredContrast('#FFFFFF', [])).toBeNull();
    const photo = { kind: 'photo' as const, elementId: 'photo' };
    const options = textColorOptions(photo, 'body', 'body', lightPhoto);
    expect(options.find((option) => option.color.id === 'white')?.allowed).toBe(false);
    expect(options.find((option) => option.color.id === 'ink')?.allowed).toBe(true);
  });

  it('switches text that would fail when the background changes', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [body({ colorId: 'white', text: "Don't miss out" })],
    };
    const result = enforceTextColors(scene);
    expect(result.scene.elements[0]).toMatchObject({ colorId: 'ink' });
    expect(result.switches).toEqual([
      { elementId: 'body', text: "Don't miss out", colorName: 'Ink' },
    ]);
    expect(switchMessage(result.switches[0])).toBe(
      'Switched "Don\'t miss out" to Ink so it reads on that background',
    );
    const unchanged = enforceTextColors({ ...scene, backgroundId: 'deep-teal' });
    expect(unchanged.switches).toEqual([]);
    expect(unchanged.scene).toEqual({ ...scene, backgroundId: 'deep-teal' });
  });
});

describe('backdrops', () => {
  it('finds the shape or photo under an element, or the background', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [
        {
          ...BASE_DEFAULTS,
          id: 'panel',
          kind: 'shape',
          shape: 'block',
          colorId: 'deep-teal',
          left: 0,
          top: 0,
          width: 1080,
          height: 600,
        },
        headline(),
        body({ top: 900 }),
      ],
    };
    expect(backdropFor(scene, 'headline')).toMatchObject({ kind: 'color', elementId: 'panel' });
    expect(backdropFor(scene, 'body')).toMatchObject({ kind: 'color', elementId: null });
    const hidden = { ...scene, elements: [{ ...scene.elements[0], hidden: true }, headline()] };
    expect(backdropFor(hidden, 'headline')).toMatchObject({ elementId: null });
  });

  it('blends a translucent shape with what is under it before judging contrast', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [
        {
          ...BASE_DEFAULTS,
          id: 'panel',
          kind: 'shape',
          shape: 'block',
          colorId: 'deep-teal',
          opacity: 0.1,
          left: 0,
          top: 0,
          width: 1080,
          height: 600,
        },
        body({ top: 100, colorId: 'white' }),
      ],
    };
    const backdrop = backdropFor(scene, 'body');
    expect(backdrop).toMatchObject({ kind: 'color', elementId: 'panel' });
    if (backdrop.kind !== 'color') throw new Error('Expected a color backdrop');
    expect(backdrop.color.hex).toBe('#E6ECEE');
    expect(backdrop.color.name).toBe('Deep teal at 10%');
    expect(contrastRatio('#FFFFFF', backdrop.color.hex)).toBeLessThan(1.3);
    const enforced = enforceTextColors(scene);
    const text = enforced.scene.elements.find((element) => element.id === 'body') as TextElement;
    expect(text.colorId).not.toBe('white');
  });

  it('follows a rotated shape to where it is drawn', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [
        {
          ...BASE_DEFAULTS,
          id: 'panel',
          kind: 'shape',
          shape: 'block',
          colorId: 'deep-teal',
          rotation: 90,
          left: 0,
          top: 600,
          width: 1080,
          height: 100,
        },
        body({ left: 0, top: 620, width: 100, height: 60 }),
        body({ id: 'middle', left: 500, top: 620, width: 80, height: 60 }),
      ],
    };
    expect(backdropFor(scene, 'body')).toMatchObject({ kind: 'color', elementId: null });
    expect(backdropFor(scene, 'middle')).toMatchObject({ kind: 'color', elementId: 'panel' });
  });

  it('judges faded text by the color it is drawn in', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [body({ colorId: 'ink', opacity: 0.1 })],
    };
    const issues = checkScene(scene, {});
    expect(issues.some((issue) => /at 10% opacity/.test(issue.message))).toBe(true);
    const ink = textColorOptions(
      { kind: 'color', color: findColor('white'), elementId: null },
      'body',
      'body',
      undefined,
      0.1,
    ).find((option) => option.color.id === 'ink');
    expect(ink?.allowed).toBe(false);
    expect(ink?.ratio).toBeLessThan(1.3);
    expect(measuredContrast('#1E282B', pixelsOf('#FFFFFF', 4), 0.1)).toBeLessThan(1.3);
  });

  it('looks through a fully transparent shape to the background', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [
        {
          ...BASE_DEFAULTS,
          id: 'panel',
          kind: 'shape',
          shape: 'block',
          colorId: 'deep-teal',
          opacity: 0,
          left: 0,
          top: 0,
          width: 1080,
          height: 600,
        },
        body({ top: 100 }),
      ],
    };
    expect(backdropFor(scene, 'body')).toMatchObject({ kind: 'color', elementId: null });
  });
});

describe('logo', () => {
  it('picks the treatment from the background', () => {
    expect(logoTreatment(deepTeal)).toBe('white');
    expect(logoTreatment({ kind: 'color', color: findColor('white'), elementId: null })).toBe(
      'color',
    );
    expect(logoTreatment({ kind: 'color', color: findColor('yellow'), elementId: null })).toBe(
      'black',
    );
    expect(logoTreatment({ kind: 'photo', elementId: 'photo' })).toBe('white');
  });

  it('keeps the minimum size and the clear space', () => {
    const format = findFormat('instagram-post');
    expect(logoMinimumHeight('horizontal', format)).toBe(72);
    expect(logoMinimumHeight('monogram', format)).toBe(48);
    const shrunk = constrainLogo(logo({ height: 10, left: 0, top: 0, rotation: 20 }), format);
    expect(shrunk.height).toBe(72);
    expect(shrunk.left).toBe(36);
    expect(shrunk.top).toBe(36);
    expect(shrunk.rotation).toBe(0);
    const pushed = constrainLogo(logo({ left: 5000, top: 5000 }), format);
    expect(pushed.left + pushed.width).toBeCloseTo(1080 - 45);
    expect(pushed.top + pushed.height).toBeCloseTo(1350 - 45);
  });
});

describe('checkScene', () => {
  it('is quiet for an on brand scene', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'deep-teal',
      elements: [headline(), body({ top: 400 }), logo()],
    };
    expect(checkScene(scene)).toEqual([]);
  });

  it('lists everything that is off', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [
        headline({ colorId: 'yellow' }),
        body({ text: 'SHOUTING TEXT', top: 400, colorId: 'white' }),
        body({ id: 'edge', left: 900, top: 500 }),
        logo({ height: 20, left: 2, top: 2 }),
      ],
    };
    const messages = checkScene(scene).map((issue) => issue.message);
    expect(messages.some((message) => message.includes('Yellow highlights'))).toBe(true);
    expect(messages.some((message) => message.includes('all caps'))).toBe(true);
    expect(
      messages.some(
        (message) => message.includes('needs 4.5:1') || message.includes('it needs 4.5:1'),
      ),
    ).toBe(true);
    expect(messages.some((message) => message.includes('runs off the edge'))).toBe(true);
    expect(messages.some((message) => message.includes('minimum size'))).toBe(true);
    expect(messages.some((message) => message.includes('clear space'))).toBe(true);
  });

  it('flags text on a photo that measures too low', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [
        {
          ...BASE_DEFAULTS,
          id: 'photo',
          kind: 'image',
          photoId: 'upload',
          naturalWidth: 1000,
          naturalHeight: 1000,
          zoom: 1,
          left: 0,
          top: 0,
          width: 1080,
          height: 1350,
        },
        body({ colorId: 'white' }),
      ],
    };
    expect(checkScene(scene)).toEqual([]);
    const issues = checkScene(scene, { body: pixelsOf('#FAFAFA', 20) });
    expect(issues[0].message).toContain('measured on the photo');
  });
});
