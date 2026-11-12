import { hexToRgb } from './contrast';
import { findColor } from './palette';

export type ImageTreatmentId = 'overlay' | 'full-color' | 'accent-rescue';

export type OverlayTextSide = 'left' | 'right' | 'top' | 'bottom';

export interface ImageTreatment {
  id: ImageTreatmentId;
  number: string;
  name: string;
  use: string;
}

export interface HeroOverlay {
  fromHex: string;
  toHex: string;
  minimumOpacity: number;
  maximumOpacity: number;
}

export interface GuidanceGroup {
  id: string;
  title: string;
  items: string[];
}

export const HERO_OVERLAY: HeroOverlay = {
  fromHex: '#051925',
  toHex: findColor('ocean').hex,
  minimumOpacity: 0.15,
  maximumOpacity: 0.3,
};

export const ACCENT_RESCUE_IDS = ['yellow', 'orange', 'lime'];

export const IMAGE_TREATMENTS: ImageTreatment[] = [
  {
    id: 'overlay',
    number: '01',
    name: 'Overlay',
    use: 'Heroes, social posts and event graphics. A thin hero overlay, from Navy-black on the text side to Ocean toward the subject, at 15 to 30% opacity, so warm light still glows through.',
  },
  {
    id: 'full-color',
    number: '02',
    name: 'Full color',
    use: 'Content photos, spaces and people. No overlay and no duotone.',
  },
  {
    id: 'accent-rescue',
    number: '03',
    name: 'Accent rescue',
    use: 'A cool photo with no warmth gets one warm accent, Yellow, Orange or Lime, on a tag, a rule or a subhead.',
  },
];

export const PHOTO_GUIDANCE: GuidanceGroup[] = [
  {
    id: 'show',
    title: 'What to show',
    items: [
      'Every image carries some warmth: skin tones, natural or lamp light, wood, brick, city lights.',
      'Real work and real people: labs, workbenches, prototypes, conversations.',
      'Mostly candid moments, with the occasional founder hero portrait.',
      'Asymmetric frames that leave room for text, and a range that includes wide shots.',
      'Judge by eye: if warm areas go gray or blue, the overlay is too heavy.',
    ],
  },
  {
    id: 'shoot',
    title: 'How to shoot and edit',
    items: [
      'Natural light and balanced exposure, with soft flash for dark rooms.',
      'Shoot RAW, and edit only exposure and contrast.',
      'No artistic filters and no black and white.',
    ],
  },
  {
    id: 'avoid',
    title: 'Avoid',
    items: [
      'People on phones or looking bored.',
      'Visible alcohol.',
      'Crowds from behind.',
      'Cluttered compositions.',
      'Black and white.',
      'Generic stock: handshakes, posed smiles, abstract tech with no people.',
      'Obviously AI generated images: waxy skin, warped hands or text, impossible lighting, glowing suns, lens flares, holograms.',
      'Full-frame cool duotone, which is retired because it reads clinical.',
      'Overlays so heavy the subject disappears.',
    ],
  },
  {
    id: 'sources',
    title: 'Sources',
    items: [
      'Our own professional event photography comes first.',
      'Licensed stock photography that MassChallenge holds a license for may be used when it looks believable and follows these rules. Ask MassChallenge Marketing for it.',
      'Location photos for each site, by city in the US and by country elsewhere, follow the same rules.',
      'Never present an AI generated image as a real founder, partner or event.',
    ],
  },
];

export const VIDEO_GUIDANCE: GuidanceGroup[] = [
  {
    id: 'look',
    title: 'Look',
    items: [
      'The photography rules apply: real people, balanced exposure and warmth in the frame.',
      'Interviews are framed on the rule of thirds, with the eyes near a top intersection and lead room in the direction the subject faces.',
      'Only use footage MassChallenge has licensed or shot itself.',
    ],
  },
  {
    id: 'package',
    title: 'Slates and lower thirds',
    items: [
      'Every video uses the standard logo open and end slates.',
      'Lower thirds are a Navy block with a Cyan rule: the name in Oswald SemiBold and the title in Lato, bottom left, inside the title safe area.',
      'Final exports are approved by MassChallenge Marketing before they go live.',
    ],
  },
];

export const LOWER_THIRD = {
  blockId: 'navy',
  ruleId: 'cyan',
  nameStyle: 'Oswald SemiBold',
  titleStyle: 'Lato',
  position: 'Bottom left, inside the title safe area',
};

export const clampOverlayOpacity = (opacity: number): number =>
  Math.min(HERO_OVERLAY.maximumOpacity, Math.max(HERO_OVERLAY.minimumOpacity, opacity));

const rgbText = (hex: string, opacity: number) => {
  const { red, green, blue } = hexToRgb(hex);
  return `rgb(${red} ${green} ${blue} / ${opacity})`;
};

const SIDE_ANGLES: Record<OverlayTextSide, number> = {
  left: 90,
  right: 270,
  top: 180,
  bottom: 0,
};

export const heroOverlayCss = (
  textSide: OverlayTextSide = 'left',
  opacity = HERO_OVERLAY.maximumOpacity,
): string => {
  const strength = clampOverlayOpacity(opacity);
  return `linear-gradient(${SIDE_ANGLES[textSide]}deg, ${rgbText(HERO_OVERLAY.fromHex, strength)}, ${rgbText(HERO_OVERLAY.toHex, strength)})`;
};

export const overlayColorAt = (position: number): [number, number, number] => {
  const from = hexToRgb(HERO_OVERLAY.fromHex);
  const to = hexToRgb(HERO_OVERLAY.toHex);
  const clamped = Math.min(1, Math.max(0, position));
  const mix = (start: number, end: number) => start + (end - start) * clamped;
  return [mix(from.red, to.red), mix(from.green, to.green), mix(from.blue, to.blue)];
};

export const overlayPixel = (
  red: number,
  green: number,
  blue: number,
  position: number,
  opacity = HERO_OVERLAY.maximumOpacity,
): [number, number, number] => {
  const strength = clampOverlayOpacity(opacity);
  const [overlayRed, overlayGreen, overlayBlue] = overlayColorAt(position);
  const blend = (channel: number, overlayChannel: number) =>
    Math.round(channel * (1 - strength) + overlayChannel * strength);
  return [blend(red, overlayRed), blend(green, overlayGreen), blend(blue, overlayBlue)];
};

const positionFor = (
  column: number,
  row: number,
  width: number,
  height: number,
  textSide: OverlayTextSide,
): number => {
  const across = width > 1 ? column / (width - 1) : 0;
  const down = height > 1 ? row / (height - 1) : 0;
  const positions: Record<OverlayTextSide, number> = {
    left: across,
    right: 1 - across,
    top: down,
    bottom: 1 - down,
  };
  return positions[textSide];
};

export const applyHeroOverlay = <Pixels extends Uint8ClampedArray | number[]>(
  pixels: Pixels,
  width: number,
  height: number,
  textSide: OverlayTextSide = 'left',
  opacity = HERO_OVERLAY.maximumOpacity,
): Pixels => {
  for (let offset = 0; offset + 3 < pixels.length; offset += 4) {
    const index = offset / 4;
    const position = positionFor(index % width, Math.floor(index / width), width, height, textSide);
    const [red, green, blue] = overlayPixel(
      pixels[offset],
      pixels[offset + 1],
      pixels[offset + 2],
      position,
      opacity,
    );
    pixels[offset] = red;
    pixels[offset + 1] = green;
    pixels[offset + 2] = blue;
  }
  return pixels;
};
