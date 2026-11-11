import { Button, EmptyState } from '@masschallenge/propellant-web';
import { APPROVED_PHOTOS, type ApprovedPhoto } from '../../../brand/photo-library';

interface PhotoLibraryProps {
  photos?: ApprovedPhoto[];
}

const PhotoLibrary = ({ photos = APPROVED_PHOTOS }: PhotoLibraryProps) => {
  if (!photos.length) {
    return (
      <EmptyState
        framed
        titleAs="h4"
        title="No approved photos yet"
        description="The brand team adds approved MassChallenge photos to the photo library manifest, src/brand/photo-library.ts, with their alt text, source and permission. Until then, follow the photography guide and check your own photos above."
        actions={
          <Button variant="tinted" href="/guidelines/photography/">
            Read the photography guide
          </Button>
        }
      />
    );
  }
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <li key={photo.id} className="m-0">
          <figure className="m-0 flex flex-col gap-2">
            <img
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              loading="lazy"
              className="block aspect-[3/2] h-auto w-full rounded-[var(--corner-lg)] bg-[var(--bg-secondary)] object-contain"
            />
            <figcaption className="text-footnote text-[var(--label-secondary)]">
              {photo.event}
              {photo.credit ? `. Photo by ${photo.credit}` : ''}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
};

export default PhotoLibrary;
