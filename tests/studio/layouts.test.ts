import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/brand/contrast';
import { BRAND_COLORS, findColor } from '../../src/brand/palette';
import { textReservation } from '../../src/studio/colorRules';
import { POST_FORMATS } from '../../src/studio/formats';
import { backdropFor, checkScene } from '../../src/studio/guardrails';
import { generateLayouts, type Brief } from '../../src/studio/layouts';
import { requiredContrast } from '../../src/studio/typography';
import { fakeMeasure } from './helpers';

const brief = (patch: Partial<Brief> = {}): Brief => ({
  formatId: 'instagram-post',
  smallLine: 'Boston, June 12',
  bigLine: 'Demo day is here',
  details: 'Meet the startups of this year at the Seaport.',
  callToAction: '@masschallenge',
  photo: null,
  ...patch,
});

const withPhoto = brief({ photo: { id: 'upload', width: 1600, height: 1200 } });

describe('generateLayouts', () => {
  it('makes six distinct layouts', () => {
    const layouts = generateLayouts(brief(), 0, fakeMeasure);
    expect(layouts).toHaveLength(6);
    expect(new Set(layouts.map((layout) => layout.id)).size).toBe(6);
    expect(new Set(layouts.map((layout) => layout.name)).size).toBe(6);
  });

  it('is deterministic for a seed and changes colors between seeds', () => {
    expect(generateLayouts(brief(), 4, fakeMeasure)).toEqual(
      generateLayouts(brief(), 4, fakeMeasure),
    );
    const names = new Set(
      Array.from({ length: 8 }, (_unused, seed) =>
        generateLayouts(brief(), seed, fakeMeasure)
          .map((layout) => layout.name)
          .join('|'),
      ),
    );
    expect(names.size).toBeGreaterThan(1);
  });

  it('only uses photo layouts when there is a photo', () => {
    const without = generateLayouts(brief(), 0, fakeMeasure);
    expect(
      without
        .flatMap((layout) => layout.scene.elements)
        .some((element) => element.kind === 'image'),
    ).toBe(false);
    const withImage = generateLayouts(withPhoto, 0, fakeMeasure);
    expect(
      withImage.filter((layout) =>
        layout.scene.elements.some((element) => element.kind === 'image'),
      ),
    ).toHaveLength(2);
  });

  it('sets the headline in capitals and keeps the words', () => {
    const scene = generateLayouts(brief(), 0, fakeMeasure)[0].scene;
    const texts = scene.elements.flatMap((element) => (element.kind === 'text' ? [element] : []));
    expect(texts.find((element) => element.role === 'headline')?.text).toBe('DEMO DAY IS HERE');
    expect(texts.map((element) => element.text)).toContain('@masschallenge');
    const shouted = generateLayouts(brief({ details: 'COME ALONG' }), 0, fakeMeasure)[0].scene;
    expect(
      shouted.elements.some((element) => element.kind === 'text' && element.text === 'Come along'),
    ).toBe(true);
  });

  it('uses only brand colors and passing pairings, for every format and many seeds', () => {
    const brandIds = new Set(BRAND_COLORS.map((color) => color.id));
    POST_FORMATS.forEach((format) => {
      [brief({ formatId: format.id }), { ...withPhoto, formatId: format.id }].forEach((entry) => {
        Array.from({ length: 25 }, (_unused, seed) => seed).forEach((seed) => {
          generateLayouts(entry, seed, fakeMeasure).forEach((layout) => {
            const { scene } = layout;
            expect(brandIds.has(scene.backgroundId)).toBe(true);
            scene.elements.forEach((element) => {
              if (element.kind === 'shape') expect(brandIds.has(element.colorId)).toBe(true);
              if (element.kind !== 'text') return;
              expect(textReservation(element.colorId)).toBeNull();
              const backdrop = backdropFor(scene, element.id);
              expect(backdrop.kind).toBe('color');
              if (backdrop.kind !== 'color') return;
              expect(
                contrastRatio(findColor(element.colorId).hex, backdrop.color.hex),
                `${format.id} ${seed} ${layout.id} ${element.id} ${element.colorId} on ${backdrop.color.id}`,
              ).toBeGreaterThanOrEqual(requiredContrast(element.role, element.size));
            });
            expect(checkScene(scene)).toEqual([]);
          });
        });
      });
    });
  });
});
