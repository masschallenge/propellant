import * as React from 'react';
import { Badge } from '@masschallenge/propellant-web';
import { pagePath } from '../../../brand/photo-library';
import { WEBSITE_VIDEOS } from '../../../brand/video-manifest';
import {
  channelLabel,
  filterVideos,
  placementNote,
  thumbnailFor,
  uniquePages,
  videoLabel,
  type VideoFilter,
  type WebsiteVideo,
} from '../../../brand/video-library';
import FilterChips from './FilterChips';

const FILTER_NAMES: Record<VideoFilter, string> = {
  all: 'All',
  masschallenge: 'MassChallenge channel',
  others: 'Other or unknown channels',
};

const PlayGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

interface VideoCardProps {
  video: WebsiteVideo;
  label: string;
}

const VideoCard = ({ video, label }: VideoCardProps) => {
  const thumbnail = thumbnailFor(video);
  const note = placementNote(video);
  return (
    <li className="m-0">
      <article className="flex h-full flex-col gap-2">
        <div className="relative overflow-hidden rounded-[var(--corner-lg)]">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="block aspect-video h-auto w-full bg-[var(--bg-secondary)] object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-[var(--separator-strong)] bg-[var(--bg-secondary)] p-4 text-center">
              <span className="text-[length:var(--type-footnote-size)] font-bold uppercase tracking-[0.08em] text-[var(--label-secondary)]">
                No thumbnail
              </span>
              <span className="text-[length:var(--type-caption-size)] text-[var(--label-secondary)]">
                {video.platform === 'Vimeo'
                  ? 'Vimeo does not share one here. Open the video to see it.'
                  : 'An uploaded video file. Open it to see it.'}
              </span>
            </div>
          )}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-2 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--teal-900)] text-[var(--gray-0)]"
          >
            <PlayGlyph />
          </span>
        </div>
        <h4 className="m-0 text-[length:var(--type-headline-size)] font-semibold leading-[var(--type-headline-line)] text-[var(--label)]">
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="text-inherit no-underline hover:underline focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-[var(--focus-color)]"
          >
            {label}
            <span className="sr-only"> (opens on {video.platform})</span>
          </a>
        </h4>
        <p className="m-0 flex flex-wrap items-center gap-1.5 text-[length:var(--type-footnote-size)] text-[var(--label-secondary)]">
          <Badge size="sm">{video.platform}</Badge>
          <span>{channelLabel(video)}</span>
        </p>
        <p className="m-0 text-[length:var(--type-footnote-size)] leading-[var(--type-footnote-line)] text-[var(--label-secondary)]">
          {note || (
            <>
              On{' '}
              {uniquePages(video.pages).map((page, index) => (
                <React.Fragment key={page}>
                  {index ? ', ' : ''}
                  <a
                    href={page}
                    className="break-all text-[var(--tint)] underline-offset-4 hover:underline"
                  >
                    {pagePath(page)}
                  </a>
                </React.Fragment>
              ))}
            </>
          )}
        </p>
      </article>
    </li>
  );
};

const VideoLibrary = () => {
  const [filter, setFilter] = React.useState<VideoFilter>('all');
  const shown = filterVideos(WEBSITE_VIDEOS, filter);
  const chips = (Object.keys(FILTER_NAMES) as VideoFilter[]).map((id) => ({
    id,
    label: FILTER_NAMES[id],
    count: filterVideos(WEBSITE_VIDEOS, id).length,
  }));

  return (
    <div className="flex flex-col gap-5">
      <FilterChips
        label="Show videos by channel"
        chips={chips}
        value={filter}
        onChange={(id) => setFilter(id as VideoFilter)}
      />
      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((video) => (
          <VideoCard key={video.url} video={video} label={videoLabel(video, WEBSITE_VIDEOS)} />
        ))}
      </ul>
    </div>
  );
};

export default VideoLibrary;
