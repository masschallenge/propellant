export type PhotoTreatment = 'natural' | 'duotone';

export interface ApprovedPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  treatment: PhotoTreatment;
  event: string;
  credit?: string;
  hasRelease: boolean;
}

export const APPROVED_PHOTOS: ApprovedPhoto[] = [];

export const MINIMUM_PHOTO_WIDTH = 1200;

export const photoProblems = (photo: ApprovedPhoto): string[] => [
  ...(photo.alt.trim() ? [] : ['It needs alt text that says what matters in it.']),
  ...(photo.width >= MINIMUM_PHOTO_WIDTH
    ? []
    : [`It is narrower than ${MINIMUM_PHOTO_WIDTH} pixels, so it may look blurry.`]),
  ...(photo.hasRelease ? [] : ['It needs permission from the people in it.']),
  ...(photo.event.trim() ? [] : ['It needs the event, place and date it came from.']),
];

export const isApproved = (photo: ApprovedPhoto) => photoProblems(photo).length === 0;
