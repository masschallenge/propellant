import { describe, expect, it } from 'vitest';
import { findFormat } from '../../src/studio/formats';
import { checkScene } from '../../src/studio/guardrails';
import { generateLayouts } from '../../src/studio/layouts';
import { reflowScene } from '../../src/studio/reflow';
import {
  BASE_DEFAULTS,
  addElement,
  blankScene,
  displayText,
  elementLabel,
  findElement,
  layoutSceneText,
  moveLayer,
  removeElement,
  updateElement,
  type Scene,
  type ShapeElement,
  type TextElement,
} from '../../src/studio/scene';
import { fakeMeasure } from './helpers';

const shape = (id: string): ShapeElement => ({
  ...BASE_DEFAULTS,
  id,
  kind: 'shape',
  shape: 'block',
  colorId: 'mid-teal',
  left: 0,
  top: 0,
  width: 100,
  height: 100,
});

const text: TextElement = {
  ...BASE_DEFAULTS,
  id: 'words',
  kind: 'text',
  role: 'headline',
  size: 'display',
  colorId: 'ink',
  align: 'left',
  text: 'Demo day',
  left: 72,
  top: 72,
  width: 400,
  height: 10,
};

describe('scene editing', () => {
  it('adds, updates, finds and removes elements', () => {
    const scene = addElement(blankScene('instagram-post'), shape('first'));
    const updated = updateElement(scene, 'first', { colorId: 'yellow' });
    expect(findElement(updated, 'first')).toMatchObject({ colorId: 'yellow' });
    expect(removeElement(updated, 'first').elements).toEqual([]);
    expect(findElement(updated, null)).toBeNull();
  });

  it('reorders layers', () => {
    const scene: Scene = {
      ...blankScene('instagram-post'),
      elements: [shape('bottom'), shape('middle'), shape('top')],
    };
    const ids = (next: Scene) => next.elements.map((element) => element.id);
    expect(ids(moveLayer(scene, 'bottom', 'up'))).toEqual(['middle', 'bottom', 'top']);
    expect(ids(moveLayer(scene, 'top', 'down'))).toEqual(['bottom', 'top', 'middle']);
    expect(ids(moveLayer(scene, 'bottom', 'top'))).toEqual(['middle', 'top', 'bottom']);
    expect(ids(moveLayer(scene, 'top', 'bottom'))).toEqual(['top', 'bottom', 'middle']);
    expect(moveLayer(scene, 'top', 'up')).toBe(scene);
  });

  it('names elements and shows Oswald in capitals', () => {
    expect(elementLabel(text)).toBe('Headline: Demo day');
    expect(displayText(text)).toBe('DEMO DAY');
    expect(elementLabel(shape('block'))).toBe('Block');
  });

  it('sizes text boxes to their wrapped lines', () => {
    const scene = layoutSceneText(
      { ...blankScene('instagram-post'), elements: [text] },
      fakeMeasure,
    );
    expect(scene.elements[0].height).toBe(132 * 2);
  });
});

describe('reflowScene', () => {
  it('moves every layout into a new format and keeps it on brand', () => {
    const layouts = generateLayouts(
      {
        formatId: 'instagram-post',
        smallLine: 'Boston',
        bigLine: 'Demo day',
        details: 'Meet the startups.',
        callToAction: '@masschallenge',
        photo: null,
      },
      0,
      fakeMeasure,
    );
    layouts.forEach((layout) => {
      ['instagram-square', 'story', 'event-banner'].forEach((formatId) => {
        const reflowed = reflowScene(layout.scene, formatId, fakeMeasure);
        const format = findFormat(formatId);
        expect(reflowed.formatId).toBe(formatId);
        reflowed.elements.forEach((element) => {
          expect(element.left).toBeGreaterThanOrEqual(-1);
          expect(element.left + element.width).toBeLessThanOrEqual(format.width + 1);
        });
        expect(checkScene(reflowed).filter((issue) => issue.message.includes('logo'))).toEqual([]);
      });
    });
  });

  it('keeps full bleed elements full bleed', () => {
    const scene: Scene = {
      ...blankScene('instagram-post'),
      elements: [{ ...shape('fill'), width: 1080, height: 1350 }],
    };
    expect(reflowScene(scene, 'linkedin-post', fakeMeasure).elements[0]).toMatchObject({
      left: 0,
      top: 0,
      width: 1200,
      height: 627,
    });
    expect(reflowScene(scene, 'instagram-post', fakeMeasure)).toBe(scene);
  });
});
