import type { SceneElement } from './scene';

export interface Region {
  left: number;
  top: number;
  width: number;
  height: number;
}

const turn = (horizontal: number, vertical: number, degrees: number) => {
  const angle = (degrees * Math.PI) / 180;
  return {
    horizontal: horizontal * Math.cos(angle) - vertical * Math.sin(angle),
    vertical: horizontal * Math.sin(angle) + vertical * Math.cos(angle),
  };
};

const centerOf = (element: SceneElement) => ({
  horizontal: element.left + element.width / 2,
  vertical: element.top + element.height / 2,
});

export const footprintBounds = (element: SceneElement): Region => {
  const center = centerOf(element);
  const corners = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([signX, signY]) => {
    const offset = turn(
      (signX * element.width) / 2,
      (signY * element.height) / 2,
      element.rotation,
    );
    return {
      horizontal: center.horizontal + offset.horizontal,
      vertical: center.vertical + offset.vertical,
    };
  });
  const left = Math.min(...corners.map((corner) => corner.horizontal));
  const top = Math.min(...corners.map((corner) => corner.vertical));
  return {
    left,
    top,
    width: Math.max(...corners.map((corner) => corner.horizontal)) - left,
    height: Math.max(...corners.map((corner) => corner.vertical)) - top,
  };
};

export const isInsideFootprint = (
  element: SceneElement,
  horizontal: number,
  vertical: number,
): boolean => {
  const center = centerOf(element);
  const local = turn(horizontal - center.horizontal, vertical - center.vertical, -element.rotation);
  return (
    Math.abs(local.horizontal) <= element.width / 2 &&
    Math.abs(local.vertical) <= element.height / 2
  );
};

export const maskOutsideFootprint = (
  pixels: Uint8ClampedArray,
  element: SceneElement,
  region: Region,
  scale: number,
): Uint8ClampedArray => {
  for (let row = 0; row < region.height; row += 1) {
    for (let column = 0; column < region.width; column += 1) {
      const horizontal = (region.left + column + 0.5) / scale;
      const vertical = (region.top + row + 0.5) / scale;
      if (!isInsideFootprint(element, horizontal, vertical)) {
        pixels[(row * region.width + column) * 4 + 3] = 0;
      }
    }
  }
  return pixels;
};
