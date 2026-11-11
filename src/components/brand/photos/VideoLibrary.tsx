import { WEBSITE_VIDEOS } from '../../../brand/video-manifest';
import type { WebsiteVideo } from '../../../brand/video-library';

const PlayGlyph = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M8 5.5v13l11-6.5z" />
  </svg>
);

const VideoCard = ({ video }: { video: WebsiteVideo }) => (
  <li className="m-0">
    <article className="flex h-full flex-col gap-2">
      <div className="relative overflow-hidden rounded-[var(--corner-lg)]">
        <img
          src={video.thumbnail}
          alt=""
          width={480}
          height={360}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="block aspect-video h-auto w-full bg-[var(--bg-secondary)] object-cover"
        />
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
          {video.title}
          <span className="sr-only"> (opens on YouTube)</span>
        </a>
      </h4>
    </article>
  </li>
);

const VideoLibrary = () => (
  <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
    {WEBSITE_VIDEOS.map((video) => (
      <VideoCard key={video.url} video={video} />
    ))}
  </ul>
);

export default VideoLibrary;
