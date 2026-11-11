import { describe, expect, it } from 'vitest';
import { WEBSITE_VIDEOS } from '../../src/brand/video-manifest';
import {
  channelLabel,
  filterVideos,
  placementNote,
  thumbnailFor,
  uniquePages,
  videoLabel,
  type WebsiteVideo,
} from '../../src/brand/video-library';

const byUrl = (fragment: string): WebsiteVideo => {
  const video = WEBSITE_VIDEOS.find((candidate) => candidate.url.includes(fragment));
  if (!video) throw new Error(fragment);
  return video;
};

describe('the video manifest', () => {
  it('holds the 21 videos from masschallenge.org with unique links', () => {
    expect(WEBSITE_VIDEOS).toHaveLength(21);
    expect(new Set(WEBSITE_VIDEOS.map((video) => video.url)).size).toBe(21);
  });

  it('lists each page a video appears on once', () => {
    WEBSITE_VIDEOS.forEach((video) => expect(uniquePages(video.pages)).toEqual(video.pages));
  });

  it('gives every video a distinct label', () => {
    const labels = WEBSITE_VIDEOS.map((video) => videoLabel(video, WEBSITE_VIDEOS));
    expect(new Set(labels).size).toBe(labels.length);
    labels.forEach((label) => expect(label.trim()).not.toBe(''));
  });
});

describe('honest labels', () => {
  it('labels uploads as uploads and tells the duplicate innovate2026 files apart', () => {
    expect(videoLabel(byUrl('Untitled-design.mp4'), WEBSITE_VIDEOS)).toBe(
      'Untitled design (upload)',
    );
    expect(videoLabel(byUrl('innovate2026-1.mp4'), WEBSITE_VIDEOS)).toBe(
      'innovate2026 (upload, 2026-08-19 21:41)',
    );
    expect(videoLabel(byUrl('innovate2026.mp4'), WEBSITE_VIDEOS)).toBe(
      'innovate2026 (upload, 2026-08-19 19:18)',
    );
  });

  it('says when a Vimeo title is not available instead of inventing one', () => {
    const vimeo = byUrl('vimeo.com/1122713446');
    expect(videoLabel(vimeo)).toBe('Vimeo video 1122713446 (title not available)');
    expect(channelLabel(vimeo)).toBe('Channel not available');
  });

  it('uses the YouTube thumbnail and a placeholder for the rest', () => {
    expect(thumbnailFor(WEBSITE_VIDEOS[0])).toMatch(/^https:\/\/i\.ytimg\.com\/vi\//);
    expect(thumbnailFor(byUrl('vimeo.com'))).toBeNull();
    expect(thumbnailFor(byUrl('MCCH-2024-Cohort.mp4'))).toBeNull();
  });

  it('explains where an upload lives when no page shows it', () => {
    expect(placementNote(byUrl('MCCH-2024-Cohort.mp4'))).toBe(
      'Uploaded to the masschallenge.org media library on 2024-05-24. Not found on a page.',
    );
    expect(placementNote(WEBSITE_VIDEOS[0])).toBe('');
  });

  it('filters by channel', () => {
    const ours = filterVideos(WEBSITE_VIDEOS, 'masschallenge');
    const others = filterVideos(WEBSITE_VIDEOS, 'others');
    expect(ours.length + others.length).toBe(21);
    expect(ours.every((video) => video.channel === 'MassChallenge')).toBe(true);
  });
});
