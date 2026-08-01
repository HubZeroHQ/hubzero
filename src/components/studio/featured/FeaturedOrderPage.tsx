import { PageHeader } from '@/components/studio/PageHeader';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ErrorState } from '@/components/ui/ErrorState';
import { roleHasCapability } from '@/config/permissions';
import { auth } from '@/lib/auth';
import type { FeaturedCollectionDefinition } from '@/lib/studio/featured-collections';
import { FeaturedOrderManager } from './FeaturedOrderManager';

/**
 * The server half of a collection's Featured Order screen: loads the entries,
 * enforces the same capability the write action enforces, and hands the rest
 * to the client manager.
 *
 * Checking `publish` here as well as in `setFeaturedOrderAction` is not
 * belt-and-braces for its own sake — the action is the real security boundary,
 * but showing a Member a reorder interface they cannot save would be a worse
 * experience than telling them plainly.
 */
export async function FeaturedOrderPage({
  collection,
}: {
  collection: FeaturedCollectionDefinition;
}) {
  const session = await auth();
  const canFeature = session ? roleHasCapability(session.user.role, 'publish') : false;

  if (!canFeature) {
    return (
      <ErrorState
        title="You can't change featured order."
        description="Featuring decides what appears first on the public site, so it's limited to Admins and Head Admins."
        action={
          <ButtonLink href={collection.listPath} variant="secondary">
            Back to {collection.label}
          </ButtonLink>
        }
      />
    );
  }

  const entries = await collection.listEntries();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={`${collection.label} — editorial order`}
        description={`Rank ${collection.singular} entries for the public site. Featured entries lead the /${collection.key} collection page in this order, and the highest-ranked eligible ones also fill ${collection.surface}. This is editorial: nothing here is derived from dates or reference IDs.`}
        actions={
          <ButtonLink href={collection.listPath} variant="secondary">
            Back to {collection.label}
          </ButtonLink>
        }
      />

      <FeaturedOrderManager
        collectionKey={collection.key}
        singular={collection.singular}
        surface={collection.surface}
        entries={entries}
      />
    </div>
  );
}
