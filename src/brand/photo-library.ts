export type PhotoCategory = 'community' | 'founders-at-work' | 'places' | 'teal-duotone';

export interface PhotoCategoryInfo {
  id: PhotoCategory;
  name: string;
}

export const PHOTO_CATEGORIES: PhotoCategoryInfo[] = [
  { id: 'community', name: 'Community' },
  { id: 'founders-at-work', name: 'Founders at work' },
  { id: 'places', name: 'Places' },
  { id: 'teal-duotone', name: 'Teal duotone' },
];

export const WEBSITE_ORIGIN = 'https://masschallenge.org/';

export interface LibraryPhoto {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  category: PhotoCategory;
  credit?: string;
}

export const MINIMUM_PHOTO_WIDTH = 1200;

const isOnWebsite = (url: string) => url.startsWith(WEBSITE_ORIGIN);

const FILE_NAME_ALT = /^(img|dsc|photo)[-_ ]?\d|\.(jpe?g|png|webp)$|^\d+$/i;

export const photoProblems = (photo: LibraryPhoto): string[] => [
  ...(photo.alt.trim() ? [] : ['It needs alt text that says what matters in it.']),
  ...(FILE_NAME_ALT.test(photo.alt.trim())
    ? ['Its alt text is a file name. Say what matters in the photo.']
    : []),
  ...(isOnWebsite(photo.src) ? [] : ['It must be hotlinked from masschallenge.org.']),
  ...(photo.width > 0 && photo.height > 0 ? [] : ['It needs its size in pixels.']),
  ...(PHOTO_CATEGORIES.some((category) => category.id === photo.category)
    ? []
    : ['It needs one of the library categories.']),
];

export const isApproved = (photo: LibraryPhoto) => photoProblems(photo).length === 0;

export const photoCautions = (photo: LibraryPhoto): string[] => [
  ...(photo.width >= MINIMUM_PHOTO_WIDTH
    ? []
    : [`Under ${MINIMUM_PHOTO_WIDTH} pixels wide, so keep it small.`]),
];

export type CategoryFilter = PhotoCategory | 'all';

export const filterPhotos = (photos: LibraryPhoto[], filter: CategoryFilter): LibraryPhoto[] =>
  filter === 'all' ? photos : photos.filter((photo) => photo.category === filter);

export const countByCategory = (photos: LibraryPhoto[]): Record<CategoryFilter, number> => {
  const counts = { all: photos.length } as Record<CategoryFilter, number>;
  PHOTO_CATEGORIES.forEach((category) => {
    counts[category.id] = filterPhotos(photos, category.id).length;
  });
  return counts;
};

export const sizeLabel = (photo: LibraryPhoto): string => `${photo.width} x ${photo.height} px`;
