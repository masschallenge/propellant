import type { GraphicDeviceId, GraphicExample } from './graphic-devices';

export const GRAPHIC_EXAMPLES: Partial<Record<GraphicDeviceId, GraphicExample[]>> = {
  'co-brand': [
    {
      src: 'https://masschallenge.org/wp-content/uploads/2019/04/buhler-masschallenge-casestudy-1200.png',
      alt: 'The MassChallenge logo, a plus sign and the Buhler logo on white',
      width: 1200,
      height: 800,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2019/10/blog-Barry-Callebaut-03.png',
      alt: 'The MassChallenge logo above a plus sign and the Barry Callebaut logo, inside a thin teal border',
      width: 1200,
      height: 800,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2020/10/MassMutual-Web-Image-02.png',
      alt: 'The MassChallenge logo, a plus sign and the MassMutual logo, inside a thin teal border',
      width: 1200,
      height: 800,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2023/01/pandemicx-white-house-masschallenge.png.webp',
      alt: 'A teal panel with the white MassChallenge logo beside the seal of the White House Office of Science and Technology Policy',
      width: 1200,
      height: 800,
    },
  ],
  'program-lockup': [
    {
      src: 'https://masschallenge.org/wp-content/uploads/2026/04/RESOLVE-%E2%80%9826-1-1024x218.png',
      alt: 'The white MC monogram, a thin vertical divider and RESOLVE 2026 in capitals, on black',
      width: 1024,
      height: 218,
      isOnDark: true,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2026/10/SMU-cox-1024x1024.png',
      alt: 'The SMU Cox and MassChallenge logos split by a thin divider above the words Fintech Coalition, on a blue brush stroke over teal',
      width: 1024,
      height: 1024,
    },
  ],
  'hexagon-frame': [
    {
      src: 'https://masschallenge.org/wp-content/uploads/2025/11/Screenshot-2025-11-05-at-6.52.12-PM-1024x725.png',
      alt: 'A circular photo of two women at a laptop inside a pale teal network of hexagons and lines',
      width: 1024,
      height: 725,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2025/11/geo-website-1.png',
      alt: 'A circular photo of a man facing a wall of notes inside a pale teal network of hexagons and lines',
      width: 600,
      height: 400,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2025/11/geo-website-2.png',
      alt: 'A circular photo of two women writing on glass inside a pale teal network of hexagons and lines',
      width: 600,
      height: 400,
    },
  ],
  'teal-duotone': [
    {
      src: 'https://masschallenge.org/wp-content/uploads/2025/10/network.png',
      alt: 'A teal duotone photo of a man writing on a wall of sticky notes while two colleagues watch',
      width: 1920,
      height: 1080,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2025/11/about.png',
      alt: 'A teal duotone photo of glass office buildings beside a marina',
      width: 1920,
      height: 1080,
    },
    {
      src: 'https://masschallenge.org/wp-content/uploads/2025/11/food-systems-hero-1.png',
      alt: 'A teal duotone photo of two women tending lettuce in a greenhouse, one holding a tablet',
      width: 1920,
      height: 1080,
    },
  ],
};
