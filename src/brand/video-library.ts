export type VideoPlatform = 'YouTube' | 'Vimeo' | 'masschallenge.org';

export interface WebsiteVideo {
  url: string;
  platform: VideoPlatform;
  title: string;
  channel: string;
  thumbnail: string;
  pages: string[];
  uploaded?: string;
}

export const VIDEO_RIGHTS_NOTE =
  'Used on masschallenge.org. Confirm releases before using it outside MassChallenge channels.';

const uploadTime = (uploaded: string): string => uploaded.replace('T', ' ').slice(0, 16);

const vimeoId = (url: string): string => url.split('/').filter(Boolean).pop() ?? url;

export const videoLabel = (video: WebsiteVideo, videos: WebsiteVideo[] = []): string => {
  if (video.platform === 'Vimeo' && !video.title.trim()) {
    return `Vimeo video ${vimeoId(video.url)} (title not available)`;
  }
  if (video.platform === 'masschallenge.org') {
    const sharesTitle = videos.some(
      (other) =>
        other !== video && other.platform === video.platform && other.title === video.title,
    );
    return sharesTitle && video.uploaded
      ? `${video.title} (upload, ${uploadTime(video.uploaded)})`
      : `${video.title} (upload)`;
  }
  return video.title.trim() || video.url;
};

export const channelLabel = (video: WebsiteVideo): string =>
  video.channel.trim() || 'Channel not available';

export const isMassChallengeChannel = (video: WebsiteVideo): boolean =>
  video.channel === 'MassChallenge';

export const placementNote = (video: WebsiteVideo): string => {
  if (video.pages.length) return '';
  const date = video.uploaded ? ` on ${video.uploaded.slice(0, 10)}` : '';
  return `Uploaded to the masschallenge.org media library${date}. Not found on a page.`;
};

export const thumbnailFor = (video: WebsiteVideo): string | null =>
  video.platform === 'YouTube' && video.thumbnail ? video.thumbnail : null;

export const uniquePages = (pages: string[]): string[] => [...new Set(pages)];

export type VideoFilter = 'all' | 'masschallenge' | 'others';

export const filterVideos = (videos: WebsiteVideo[], filter: VideoFilter): WebsiteVideo[] => {
  if (filter === 'masschallenge') return videos.filter(isMassChallengeChannel);
  if (filter === 'others') return videos.filter((video) => !isMassChallengeChannel(video));
  return videos;
};
