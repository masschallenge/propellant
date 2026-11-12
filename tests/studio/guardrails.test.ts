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
    expect(byId.cyan.allowed).toBe(true);
    expect(byId.black.allowed).toBe(false);
    expect(byId.black.reason).toMatch(
      /^Only 1\.\d:1 on Deep Teal\. Text this size needs 4\.5:1\.$/,
    );
    expect(byId['mc-blue'].reason).toContain('never text');
    expect(byId.raspberry.allowed).toBe(false);
    options
      .filter((option) => option.allowed)
      .forEach((option) =>
        expect(contrastRatio(option.color.hex, '#004F73')).toBeGreaterThanOrEqual(4.5),
      );
  });

  it('keeps Cyan and Lime text on Navy, Black and Deep Teal only', () => {
    const onWhite = textColorOptions(
      { kind: 'color', color: findColor('white'), elementId: null },
      'headline',
      'display',
    );
    const cyan = onWhite.find((option) => option.color.id === 'cyan');
    expect(cyan?.allowed).toBe(false);
    expect(cyan?.reason).toBe('Cyan only goes on Navy, Black or Deep Teal.');
    const onTeal = textColorOptions(
      { kind: 'color', color: findColor('teal'), elementId: null },
      'headline',
      'display',
    );
    expect(onTeal.find((option) => option.color.id === 'cyan')?.allowed).toBe(false);
    const onNavy = textColorOptions(
      { kind: 'color', color: findColor('navy'), elementId: null },
      'body',
      'body',
    );
    expect(onNavy.find((option) => option.color.id === 'lime')?.allowed).toBe(true);
  });

  it('lets large headlines use 3:1', () => {
    const raspberry = { kind: 'color' as const, color: findColor('raspberry'), elementId: null };
    const white = (roleId: 'headline' | 'body') =>
      textColorOptions(raspberry, roleId, roleId === 'headline' ? 'display' : 'body').find(
        (option) => option.color.id === 'white',
      );
    expect(white('headline')?.allowed).toBe(true);
    expect(white('body')?.allowed).toBe(false);
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
    expect(options.find((option) => option.color.id === 'black')?.allowed).toBe(true);
  });

  it('switches text that would fail when the background changes', () => {
    const scene: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [body({ colorId: 'white', text: "Don't miss out" })],
    };
    const result = enforceTextColors(scene);
    expect(result.scene.elements[0]).toMatchObject({ colorId: 'black' });
    expect(result.switches).toEqual([
      { elementId: 'body', text: "Don't miss out", colorName: 'Black' },
    ]);
    expect(switchMessage(result.switches[0])).toBe(
      'Switched "Don\'t miss out" to Black so it reads on that background',
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
    expect(backdrop.color.hex).toBe('#E6EDF1');
    expect(backdrop.color.name).toBe('Deep Teal at 10%');
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
      elements: [body({ colorId: 'black', opacity: 0.1 })],
    };
    const issues = checkScene(scene, {});
    expect(issues.some((issue) => /at 10% opacity/.test(issue.message))).toBe(true);
    const black = textColorOptions(
      { kind: 'color', color: findColor('white'), elementId: null },
      'body',
      'body',
      undefined,
      0.1,
    ).find((option) => option.color.id === 'black');
    expect(black?.allowed).toBe(false);
    expect(black?.ratio).toBeLessThan(1.3);
    expect(measuredContrast('#222222', pixelsOf('#FFFFFF', 4), 0.1)).toBeLessThan(1.3);
  });

  it('judges text that spans more than one background against all of them', () => {
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
          left: 490,
          top: 0,
          width: 100,
          height: 1350,
        },
        body({ left: 290, top: 600, width: 500, height: 60, colorId: 'white' }),
      ],
    };
    const backdrop = backdropFor(scene, 'body');
    expect(backdrop.kind).toBe('mixed');
    if (backdrop.kind !== 'mixed') throw new Error('Expected a mixed backdrop');
    expect(backdrop.colors.map((color) => color.id).sort()).toEqual(['deep-teal', 'white']);
    const issues = checkScene(scene, {});
    expect(
      issues.some((issue) => /Deep Teal and White|White and Deep Teal/.test(issue.message)),
    ).toBe(true);
    const enforced = enforceTextColors(scene).scene.elements.find(
      (element) => element.id === 'body',
    ) as TextElement;
    expect(enforced.colorId).not.toBe('white');
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

  it('follows the guide: full color on White or Warm White, white on the blues', () => {
    const on = (id: string) =>
      logoTreatment({ kind: 'color', color: findColor(id), elementId: null });
    expect(on('warm-white')).toBe('color');
    ['navy', 'black', 'deep-teal', 'teal', 'mc-blue'].forEach((id) => expect(on(id)).toBe('white'));
    ['cyan', 'lime', 'light-tint'].forEach((id) => expect(on(id)).toBe('black'));
    const onBlue: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'mc-blue',
      elements: [logo()],
    };
    expect(checkScene(onBlue)).toEqual([]);
  });

  it('keeps the minimum size and the clear space', () => {
    const format = findFormat('instagram-post');
    expect(logoMinimumHeight('horizontal', format)).toBe(66);
    expect(logoMinimumHeight('monogram', format)).toBe(48);
    const shrunk = constrainLogo(logo({ height: 10, left: 0, top: 0, rotation: 20 }), format);
    expect(shrunk.height).toBe(66);
    expect(shrunk.left).toBeCloseTo((66 * 91) / 225);
    expect(shrunk.top).toBeCloseTo((66 * 91) / 225);
    expect(shrunk.rotation).toBe(0);
    const pushed = constrainLogo(logo({ left: 5000, top: 5000 }), format);
    expect(pushed.left + pushed.width).toBeCloseTo(1080 - (90 * 91) / 225);
    expect(pushed.top + pushed.height).toBeCloseTo(1350 - (90 * 91) / 225);
    const mark = constrainLogo(logo({ lockup: 'monogram', height: 60, left: 0, top: 0 }), format);
    expect(mark.left).toBe(30);
  });
});

describe('rotated text and logos across backgrounds', () => {
  it('flags rotated text that the export would cut off', () => {
    const scene: Scene = {
      formatId: 'instagram-square',
      backgroundId: 'white',
      elements: [
        headline({ colorId: 'black', left: 240, top: 0, width: 600, height: 132, rotation: 90 }),
      ],
    };
    expect(checkScene(scene).some((issue) => /runs off the edge/.test(issue.message))).toBe(true);
    const upright = { ...scene, elements: [{ ...scene.elements[0], rotation: 0 }] };
    expect(checkScene(upright).some((issue) => /runs off the edge/.test(issue.message))).toBe(
      false,
    );
  });

  it('says so when no version of the logo reads on every background under it', () => {
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
          width: 300,
          height: 1350,
        },
        logo({ left: 120, top: 1100 }),
      ],
    };
    expect(
      checkScene(scene).some((issue) => /No version of the logo reads/.test(issue.message)),
    ).toBe(true);
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
    expect(messages.some((message) => message.includes('Yellow is for tags'))).toBe(true);
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

describe('warm accents and shapes on dark', () => {
  const shape = (id: string, colorId: string, patch: Record<string, number> = {}) => ({
    ...BASE_DEFAULTS,
    id,
    kind: 'shape' as const,
    shape: 'block' as const,
    colorId,
    left: 0,
    top: 0,
    width: 200,
    height: 20,
    ...patch,
  });

  it('allows one warm accent per piece', () => {
    const one: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'navy',
      elements: [shape('rule', 'yellow')],
    };
    expect(checkScene(one)).toEqual([]);
    const two: Scene = {
      ...one,
      elements: [shape('rule', 'yellow'), shape('tag', 'lime', { top: 100 })],
    };
    expect(checkScene(two).map((issue) => issue.message)).toEqual([
      'Use one warm accent per piece: Yellow and Lime are all in this piece.',
    ]);
  });

  it('keeps Raspberry, Cyan and Lime shapes on dark backgrounds', () => {
    const light: Scene = {
      formatId: 'instagram-post',
      backgroundId: 'white',
      elements: [shape('rule', 'raspberry')],
    };
    expect(checkScene(light).map((issue) => issue.message)).toEqual([
      'A shape: Raspberry only goes on Navy, Black or Deep Teal.',
    ]);
    expect(checkScene({ ...light, backgroundId: 'black' })).toEqual([]);
  });
});
