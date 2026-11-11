import * as React from 'react';
import { Badge, Button } from '@masschallenge/propellant-web';
import { WEBSITE_PHOTOS } from '../../../brand/photo-manifest';
import {
  PHOTO_CATEGORIES,
  countByCategory,
  filterPhotos,
  photoCautions,
  sizeLabel,
  type CategoryFilter,
  type LibraryPhoto,
} from '../../../brand/photo-library';
import FilterChips from './FilterChips';

const FIRST_PAGE = 12;

const CATEGORY_NAMES = Object.fromEntries(
  PHOTO_CATEGORIES.map((category) => [category.id, category.name]),
);

interface PhotoLibraryProps {
  photos?: LibraryPhoto[];
}

const PhotoCard = ({ photo }: { photo: LibraryPhoto }) => {
  const cautions = photoCautions(photo);
  return (
    <li className="m-0">
      <figure className="m-0 flex h-full flex-col gap-2">
        <a
          href={photo.src}
          target="_blank"
          rel="noreferrer"
          className="block rounded-[var(--corner-lg)] focus-visible:outline-[length:var(--focus-width)] focus-visible:outline-solid focus-visible:outline-offset-[var(--focus-offset)] focus-visible:outline-[var(--focus-color)]"
          aria-label={`Open full size: ${photo.alt}`}
        >
          <img
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="block aspect-[3/2] h-auto w-full rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] object-cover"
          />
        </a>
        <figcaption className="flex flex-col gap-1.5 text-[length:var(--type-footnote-size)] leading-[var(--type-footnote-line)] text-[var(--label-secondary)]">
          <span className="text-[length:var(--type-subheadline-size)] text-[var(--label)]">
            {photo.alt}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            <Badge size="sm">{CATEGORY_NAMES[photo.category]}</Badge>
            <span className="tabular-nums">{sizeLabel(photo)}</span>
          </span>
          {photo.credit ? <span>Photo: {photo.credit}</span> : null}
          {cautions.length ? (
            <span className="font-semibold text-[var(--label)]">{cautions.join(' ')}</span>
          ) : null}
        </figcaption>
      </figure>
    </li>
  );
};

const PhotoLibrary = ({ photos = WEBSITE_PHOTOS }: PhotoLibraryProps) => {
  const [filter, setFilter] = React.useState<CategoryFilter>('all');
  const [isShowingAll, setIsShowingAll] = React.useState(false);
  const counts = React.useMemo(() => countByCategory(photos), [photos]);
  const shown = filterPhotos(photos, filter);
  const visible = isShowingAll ? shown : shown.slice(0, FIRST_PAGE);
  const chips = [
    { id: 'all', label: 'All', count: counts.all },
    ...PHOTO_CATEGORIES.map((category) => ({
      id: category.id,
      label: category.name,
      count: counts[category.id],
    })),
  ];

  return (
    <div className="flex flex-col gap-5">
      <FilterChips
        label="Show photos by category"
        chips={chips}
        value={filter}
        onChange={(id) => {
          setFilter(id as CategoryFilter);
          setIsShowingAll(false);
        }}
      />
      <p
        className="m-0 text-[length:var(--type-callout-size)] text-[var(--label-secondary)]"
        aria-live="polite"
      >
        Showing {visible.length} of {shown.length} photos.
      </p>
      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </ul>
      {shown.length > visible.length ? (
        <div>
          <Button variant="gray" onClick={() => setIsShowingAll(true)}>
            Show all {shown.length} photos
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default PhotoLibrary;
