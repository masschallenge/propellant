import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../../src/brand/contrast';
import { findColor } from '../../src/brand/palette';
import {
  backdropFor,
  backdropName,
  checkScene,
  enforceTextColors,
  logoTreatment,
  textColorOptions,
} from '../../src/studio/guardrails';
import { BASE_DEFAULTS, type Scene, type TextElement } from '../../src/studio/scene';

const headline: TextElement = {
  ...BASE_DEFAULTS,
  id: 'headline',
  kind: 'text',
  role: 'headline',
  size: 'display',
  colorId: 'white',
  align: 'left',
  text: 'ACCELERATOR',
  left: 100,
  top: 500,
  width: 800,
  height: 120,
};

const patternScene: Scene = {
  formatId: 'instagram-post',
  backgroundId: 'white',
  pattern: 'triangles',
  elements: [headline],
};

describe('text and logos on the triangle pattern', () => {
  it('treats the pattern as the backdrop when nothing covers the text', () => {
    const backdrop = backdropFor(patternScene, 'headline');
    expect(backdrop.kind).toBe('pattern');
    expect(backdropName(backdrop)).toBe('Triangle pattern');
  });

  it('measures each text color against the weaker of the two pattern colors', () => {
    const backdrop = backdropFor(patternScene, 'headline');
    const options = textColorOptions(backdrop, 'headline', 'display');
    const white = options.find((option) => option.color.id === 'white');
    const black = options.find((option) => option.color.id === 'black');
    expect(white?.ratio).toBeCloseTo(
      Math.min(
        contrastRatio('#FFFFFF', findColor('mc-blue').hex),
        contrastRatio('#FFFFFF', findColor('light-tint').hex),
      ),
    );
    expect(white?.allowed).toBe(false);
    expect(black?.allowed).toBe(true);
  });

  it('switches white text to a color that reads on the pattern and reports nothing left', () => {
    expect(checkScene(patternScene)).toHaveLength(1);
    const { scene, switches } = enforceTextColors(patternScene);
    expect(switches).toHaveLength(1);
    expect(['black', 'navy']).toContain(
      scene.elements[0].kind === 'text' && scene.elements[0].colorId,
    );
    expect(checkScene(scene)).toEqual([]);
  });

  it('picks a logo treatment that holds 3:1 on both pattern colors', () => {
    expect(logoTreatment(backdropFor(patternScene, 'headline'))).toBe('black');
  });

  it('goes back to the plain background when the pattern is off', () => {
    expect(backdropFor({ ...patternScene, pattern: null }, 'headline').kind).toBe('color');
  });
});
