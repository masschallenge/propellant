import { describe, expect, it } from 'vitest';
import { WEBSITE_PHOTOS } from '../../src/brand/photo-manifest';
import {
  PHOTO_CATEGORIES,
  WEBSITE_RIGHTS_NOTE,
  countByCategory,
  filterPhotos,
  isApproved,
  pagePath,
  photoCautions,
  photoProblems,
  sizeLabel,
  type LibraryPhoto,
} from '../../src/brand/photo-library';

const photo: LibraryPhoto = {
  id: 'about',
  src: 'https://masschallenge.org/wp-content/uploads/2025/11/about.png',
  alt: 'A teal duotone photo of glass office buildings beside a marina',
  width: 1920,
  height: 1080,
  category: 'teal-duotone',
  sourcePages: ['https://masschallenge.org/about-us/'],
  rights: WEBSITE_RIGHTS_NOTE,
};

describe('the photo manifest', () => {
  it('holds the 94 photos from masschallenge.org, all valid and unique', () => {
    expect(WEBSITE_PHOTOS).toHaveLength(94);
    WEBSITE_PHOTOS.forEach((entry) => expect(photoProblems(entry)).toEqual([]));
    expect(new Set(WEBSITE_PHOTOS.map((entry) => entry.id)).size).toBe(WEBSITE_PHOTOS.length);
    expect(new Set(WEBSITE_PHOTOS.map((entry) => entry.src)).size).toBe(WEBSITE_PHOTOS.length);
  });

  it('gives every photo its own alt text', () => {
    expect(new Set(WEBSITE_PHOTOS.map((entry) => entry.alt)).size).toBe(WEBSITE_PHOTOS.length);
    WEBSITE_PHOTOS.forEach((entry) => {
      expect(entry.alt.split(' ').length).toBeGreaterThan(4);
      expect(entry.alt).not.toMatch(/[–—]/);
    });
  });

  it('fills every category', () => {
    const counts = countByCategory(WEBSITE_PHOTOS);
    expect(counts).toEqual({
      all: 94,
      community: 34,
      'founders-at-work': 17,
      places: 8,
      technology: 19,
      'teal-duotone': 16,
    });
  });
});

describe('the photo rules', () => {
  it('accepts a hotlinked masschallenge.org photo with its page and the rights note', () => {
    expect(isApproved(photo)).toBe(true);
  });

  it('explains what a photo is missing', () => {
    const problems = photoProblems({
      ...photo,
      alt: ' ',
      src: 'https://example.com/photo.jpg',
      sourcePages: [],
      rights: '',
      width: 0,
    });
    expect(problems).toHaveLength(5);
  });

  it('rejects a file name as alt text and a source page on another site', () => {
    expect(photoProblems({ ...photo, alt: 'IMG_8966' })).toHaveLength(1);
    expect(photoProblems({ ...photo, alt: '5' })).toHaveLength(1);
    expect(photoProblems({ ...photo, sourcePages: ['https://example.com/'] })).toHaveLength(1);
  });

  it('cautions about small photos and possible stock without blocking them', () => {
    const small = { ...photo, width: 605, category: 'technology' as const };
    expect(isApproved(small)).toBe(true);
    expect(photoCautions(small)).toHaveLength(2);
    expect(photoCautions({ ...photo, stockNote: 'The file name says Unsplash.' })).toEqual([
      'Possibly stock: The file name says Unsplash.',
    ]);
    expect(photoCautions(photo)).toEqual([]);
  });

  it('marks the Technology category as possibly licensed stock', () => {
    const technology = PHOTO_CATEGORIES.find((category) => category.id === 'technology');
    expect(technology?.note).toMatch(/licensed stock/);
  });
});

describe('the helpers', () => {
  it('filters by category', () => {
    expect(filterPhotos(WEBSITE_PHOTOS, 'all')).toHaveLength(94);
    expect(
      filterPhotos(WEBSITE_PHOTOS, 'places').every((entry) => entry.category === 'places'),
    ).toBe(true);
  });

  it('shortens page addresses and writes sizes', () => {
    expect(pagePath('https://masschallenge.org/about-us/')).toBe('/about-us/');
    expect(pagePath('https://example.com/')).toBe('https://example.com/');
    expect(sizeLabel(photo)).toBe('1920 x 1080 px');
  });
});
