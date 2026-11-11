import { describe, expect, it } from 'vitest';
import { WEBSITE_VIDEOS } from '../../src/brand/video-manifest';

describe('the video manifest', () => {
  it('holds 12 MassChallenge YouTube videos with unique links', () => {
    expect(WEBSITE_VIDEOS).toHaveLength(12);
    expect(new Set(WEBSITE_VIDEOS.map((video) => video.url)).size).toBe(12);
    WEBSITE_VIDEOS.forEach((video) => {
      expect(video.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=/);
      expect(video.thumbnail).toMatch(/^https:\/\/i\.ytimg\.com\/vi\//);
    });
  });

  it('gives every video a real, distinct title', () => {
    const titles = WEBSITE_VIDEOS.map((video) => video.title.trim());
    expect(new Set(titles).size).toBe(titles.length);
    titles.forEach((title) => expect(title.split(' ').length).toBeGreaterThan(2));
  });
});
