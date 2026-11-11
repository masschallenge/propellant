import { describe, expect, it } from 'vitest';
import {
  APPROVED_PHOTOS,
  type ApprovedPhoto,
  isApproved,
  photoProblems,
} from '../../src/brand/photo-library';

const photo: ApprovedPhoto = {
  id: 'demo-day',
  src: '/photos/demo-day-boston-2026-06-12-042.jpg',
  alt: 'Founders pitching to judges at demo day',
  width: 1920,
  height: 1280,
  treatment: 'natural',
  event: 'Demo day, Boston, 2026-06-12',
  hasRelease: true,
};

describe('the photo library', () => {
  it('only holds photos that meet the photography guide', () => {
    APPROVED_PHOTOS.forEach((entry) => expect(photoProblems(entry)).toEqual([]));
    expect(new Set(APPROVED_PHOTOS.map((entry) => entry.id)).size).toBe(APPROVED_PHOTOS.length);
  });

  it('accepts a photo with alt text, permission, a source and enough pixels', () => {
    expect(isApproved(photo)).toBe(true);
  });

  it('explains what a photo is missing', () => {
    const problems = photoProblems({
      ...photo,
      alt: ' ',
      width: 800,
      hasRelease: false,
      event: '',
    });
    expect(problems).toHaveLength(4);
  });
});
