export interface PostFormat {
  id: string;
  name: string;
  width: number;
  height: number;
}

export const POST_FORMATS: PostFormat[] = [
  { id: 'instagram-post', name: 'Instagram post 4:5', width: 1080, height: 1350 },
  { id: 'instagram-square', name: 'Instagram square', width: 1080, height: 1080 },
  { id: 'story', name: 'Story 9:16', width: 1080, height: 1920 },
  { id: 'linkedin-post', name: 'LinkedIn post', width: 1200, height: 627 },
  { id: 'event-banner', name: 'Event banner 16:9', width: 1920, height: 1080 },
];

export const DEFAULT_FORMAT_ID = 'instagram-post';

export const findFormat = (id: string): PostFormat => {
  const format = POST_FORMATS.find((candidate) => candidate.id === id);
  if (!format) throw new Error(`Unknown format: ${id}`);
  return format;
};

export const formatSizeLabel = (format: PostFormat): string =>
  `${format.width} x ${format.height} px`;

export const isLandscape = (format: PostFormat): boolean => format.width / format.height > 1.3;
