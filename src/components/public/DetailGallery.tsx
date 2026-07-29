import type { ImmutablePublic, PublicMedia } from '@/lib/public/domain';
import { DetailSectionHeading } from './EditorialPrimitives';
import { PageContainer, PublicSection } from './PageContainer';
import { PublicImage } from './PublicImage';

/**
 * The shared "media / evidence" gallery block: a heading over a grid of
 * `PublicImage`s. Replaces four near-identical copies (a collection
 * detail's gallery, a Blueprint's preview media, a Note's gallery, and an
 * Engineering Profile's gallery) that already agreed on the grid's CSS
 * class (`detail-gallery-grid`) but reimplemented the wrapper each time.
 */
export function DetailGallery({
  id,
  eyebrow,
  title,
  media,
  sectionClassName,
  gridClassName = 'detail-gallery-grid',
}: {
  id: string;
  eyebrow: string;
  title: string;
  media: readonly ImmutablePublic<PublicMedia>[];
  sectionClassName: string;
  gridClassName?: string;
}) {
  if (!media.length) return null;
  return (
    <PublicSection className={sectionClassName} aria-labelledby={id}>
      <PageContainer>
        <DetailSectionHeading
          id={id}
          eyebrow={eyebrow}
          title={title}
          className="detail-section-header"
        />
        <div className={gridClassName}>
          {media.map((item) => (
            <PublicImage key={item.url} media={item} />
          ))}
        </div>
      </PageContainer>
    </PublicSection>
  );
}
