import { describe, expect, it } from 'vitest';
import { findFormat } from '../../src/studio/formats';
import {
  BASE_DEFAULTS,
  type ImageElement,
  type LogoElement,
  type TextElement,
} from '../../src/studio/scene';
import {
  handlesFor,
  moveElement,
  nudgeDistance,
  resizeElement,
  scaleAroundCenter,
} from '../../src/studio/transform';
import { fakeMeasure } from './helpers';

const format = findFormat('instagram-post');

const image: ImageElement = {
  ...BASE_DEFAULTS,
  id: 'photo',
  kind: 'image',
  photoId: 'upload',
  naturalWidth: 400,
  naturalHeight: 300,
  zoom: 1,
  left: 100,
  top: 100,
  width: 400,
  height: 300,
};

const logo: LogoElement = {
  ...BASE_DEFAULTS,
  id: 'logo',
  kind: 'logo',
  lockup: 'monogram',
  left: 200,
  top: 200,
  height: 90,
  width: 90 * (321 / 177),
};

const text: TextElement = {
  ...BASE_DEFAULTS,
  id: 'words',
  kind: 'text',
  role: 'body',
  size: 'body',
  colorId: 'ink',
  align: 'left',
  text: 'Meet the startups',
  left: 100,
  top: 100,
  width: 1000,
  height: 66,
};

describe('transform', () => {
  it('moves elements and keeps logos out of their clear space', () => {
    expect(moveElement(image, 10, -20, format)).toMatchObject({ left: 110, top: 80 });
    const pushed = moveElement(logo, -500, -500, format);
    expect(pushed.left).toBe(45);
    expect(pushed.top).toBe(45);
  });

  it('scales images from a corner and keeps their shape', () => {
    const resized = resizeElement(image, 'bottom-right', 200, 0, format, fakeMeasure);
    expect(resized.width).toBe(600);
    expect(resized.height).toBe(450);
    const fromTopLeft = resizeElement(image, 'top-left', -200, 0, format, fakeMeasure);
    expect(fromTopLeft).toMatchObject({ left: -100, top: -50, width: 600, height: 450 });
  });

  it('never shrinks a logo below its minimum', () => {
    const shrunk = resizeElement(logo, 'bottom-right', -400, 0, format, fakeMeasure);
    expect(shrunk.height).toBe(48);
  });

  it('rewraps text when its box narrows', () => {
    const narrowed = resizeElement(text, 'right', -700, 0, format, fakeMeasure);
    expect(narrowed.width).toBe(300);
    expect(narrowed.height).toBeGreaterThan(66);
    expect(handlesFor(text)).toEqual(['left', 'right']);
    expect(handlesFor(logo)).toHaveLength(4);
  });

  it('nudges by canvas scaled steps and scales around the center', () => {
    expect(nudgeDistance(format, false)).toBe(6);
    expect(nudgeDistance(format, true)).toBe(30);
    expect(scaleAroundCenter(image, 200, 150)).toMatchObject({ left: 200, top: 175 });
  });
});
