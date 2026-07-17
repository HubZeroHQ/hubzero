import Image from 'next/image';
import type { PublicMedia } from '@/lib/public/domain';
import { cn } from '@/lib/utils/cn';

export function PublicImage({
  media,
  className,
  priority = false,
}: {
  media: PublicMedia;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure
      className={cn('public-media', className)}
      style={{ backgroundColor: media.placeholder.value }}
    >
      <Image
        src={media.url}
        alt={media.alt}
        width={media.width}
        height={media.height}
        sizes={media.responsive.sizes}
        priority={priority}
        className="h-auto w-full"
      />
      {media.caption || media.credit ? (
        <figcaption>
          {media.caption}
          {media.caption && media.credit ? ' — ' : ''}
          {media.credit}
        </figcaption>
      ) : null}
    </figure>
  );
}
