import { describe, expect, it } from 'vitest';
import { WEBSITE_PHOTOS } from '../../src/brand/photo-manifest';
import {
  countByCategory,
  filterPhotos,
  isApproved,
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
};

describe('the photo manifest', () => {
  it('holds 73 MassChallenge photos, all valid and unique', () => {
    expect(WEBSITE_PHOTOS).toHaveLength(73);
    WEBSITE_PHOTOS.forEach((entry) => expect(photoProblems(entry)).toEqual([]));
    expect(new Set(WEBSITE_PHOTOS.map((entry) => entry.id)).size).toBe(WEBSITE_PHOTOS.length);
    expect(new Set(WEBSITE_PHOTOS.map((entry) => entry.src)).size).toBe(WEBSITE_PHOTOS.length);
  });

  it('holds no stock photos', () => {
    WEBSITE_PHOTOS.forEach((entry) => expect(entry.src).not.toMatch(/adobestock|unsplash|istock/i));
  });

  it('gives every photo its own alt text', () => {
    expect(new Set(WEBSITE_PHOTOS.map((entry) => entry.alt)).size).toBe(WEBSITE_PHOTOS.length);
    WEBSITE_PHOTOS.forEach((entry) => {
      expect(entry.alt.split(' ').length).toBeGreaterThan(4);
      expect(entry.alt).not.toMatch(/[–—]/);
    });
  });

  it('fills every category', () => {
    expect(countByCategory(WEBSITE_PHOTOS)).toEqual({
      all: 73,
      community: 34,
      'founders-at-work': 15,
      places: 8,
      'teal-duotone': 16,
    });
  });
});

describe('the photo rules', () => {
  it('accepts a hotlinked MassChallenge photo', () => {
    expect(isApproved(photo)).toBe(true);
  });

  it('explains what a photo is missing', () => {
    const problems = photoProblems({
      ...photo,
      alt: ' ',
      src: 'https://example.com/photo.jpg',
      width: 0,
    });
    expect(problems).toHaveLength(3);
  });

  it('rejects a file name as alt text', () => {
    expect(photoProblems({ ...photo, alt: 'IMG_8966' })).toHaveLength(1);
    expect(photoProblems({ ...photo, alt: '5' })).toHaveLength(1);
  });

  it('cautions about small photos without blocking them', () => {
    const small = { ...photo, width: 605 };
    expect(isApproved(small)).toBe(true);
    expect(photoCautions(small)).toEqual(['Under 1200 pixels wide, so keep it small.']);
    expect(photoCautions(photo)).toEqual([]);
  });
});

describe('the helpers', () => {
  it('filters by category', () => {
    expect(filterPhotos(WEBSITE_PHOTOS, 'all')).toHaveLength(73);
    expect(
      filterPhotos(WEBSITE_PHOTOS, 'places').every((entry) => entry.category === 'places'),
    ).toBe(true);
  });

  it('writes sizes', () => {
    expect(sizeLabel(photo)).toBe('1920 x 1080 px');
  });
});
