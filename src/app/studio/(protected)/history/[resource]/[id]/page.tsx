import type { Metadata } from "next";
import { Types } from "mongoose";
import { notFound, redirect } from "next/navigation";

import "@/lib/cms/collections";

import { VersionEntryCard } from "@/components/admin/version-history/version-entry-card";
import { DiffView } from "@/components/admin/version-history/diff-view";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState, Heading, Link, Text } from "@/components/ui";
import { getCollection, getRecordLabel } from "@/lib/cms/collection-config";
import { collectDiffMediaIds, diffObjects } from "@/lib/cms/diff";
import { getMediaByIds } from "@/lib/cms/media";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { serializeDocument } from "@/lib/cms/serialize";
import { listVersions } from "@/lib/cms/version-history";
import { connectToDatabase } from "@/lib/db";
import type { Resource } from "@/types/cms";

interface VersionHistoryPageProps {
  params: Promise<{ resource: string; id: string }>;
}

export const metadata: Metadata = {
  title: "Version History — HubZero Studio",
};

/**
 * The one version-history screen every workflow-participating collection
 * gets, for free, the moment it's registered (`registerCollection()`) — no
 * per-collection route, page, or component (`ARCHITECTURE/19_CMS_FOUNDATION.md`'s
 * genericity requirement, checked directly: this is the only place Case
 * Study's version history renders, and it contains zero Case-Study-specific
 * code). `[resource]` is the `Resource` string a collection registers under
 * (`"caseStudy"`, …), not a friendly URL slug — this is deliberately an
 * infra route reached via a link from a collection's own detail page, not a
 * primary nav destination with its own pretty URL.
 */
export default async function VersionHistoryPage({ params }: VersionHistoryPageProps) {
  const { resource: resourceParam, id } = await params;
  const resource = resourceParam as Resource;
  const config = getCollection(resource);
  if (!config) notFound();

  const user = await requireSessionUser();
  if (!can(user, "view", resource)) redirect("/studio");

  if (!Types.ObjectId.isValid(id)) notFound();

  await connectToDatabase();
  const rawDoc = await config.model.findById(id).lean();
  if (!rawDoc) notFound();
  const liveDoc = serializeDocument(rawDoc) as Record<string, unknown>;

  const versions = await listVersions(resource, id);
  // Reads `config.ownerField` rather than hardcoding `createdBy` — for a
  // collection like TeamMember (`ownerField: "linkedUserId"`), "own content"
  // means whose profile it is, not who created the row during onboarding.
  // Mirrors `crud-actions.ts`'s `ownerTarget()`/`restoreVersion()`, which
  // already get this right; this generic screen previously didn't.
  const ownerField = config.ownerField ?? "createdBy";
  const ownerValue = liveDoc[ownerField];
  const canRestore = can(user, "edit", resource, {
    createdBy: typeof ownerValue === "string" ? ownerValue : undefined,
  });

  const editHref = config.studioBasePath
    ? `/studio/${config.studioBasePath}/${id}`
    : `/studio/history/${resource}/${id}`;
  const recordLabel = getRecordLabel(config, liveDoc);

  const unpublishedDiffs = diffObjects(versions[0]?.snapshot ?? null, liveDoc, config.formFields);
  const versionDiffs = versions.map((entry, index) =>
    diffObjects(versions[index + 1]?.snapshot ?? null, entry.snapshot, config.formFields),
  );

  // One batched media lookup for every diff on the page (the "unpublished
  // changes" section plus every version row) rather than each row resolving
  // its own image/gallery thumbnails — avoids an N+1 waterfall down a long
  // version history.
  const mediaIds = new Set([
    ...collectDiffMediaIds(unpublishedDiffs),
    ...versionDiffs.flatMap(collectDiffMediaIds),
  ]);
  const media = mediaIds.size > 0 ? await getMediaByIds([...mediaIds]) : [];
  const mediaMap = Object.fromEntries(media.map((item) => [item.id, item]));

  return (
    <>
      <PageHeader
        title={`Version history — ${recordLabel}`}
        description={`${config.label} · every recorded publish, newest first.`}
        breadcrumb={[{ label: config.label, href: editHref }, { label: "Version history" }]}
        actions={<Link href={editHref}>Back to edit →</Link>}
      />

      {versions.length === 0 ? (
        <EmptyState
          title="No version history yet"
          description="A version is recorded the first time this is published — nothing has been published yet."
        />
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <Heading level={3} className="mb-3">
              Unpublished changes
            </Heading>
            <Text size="caption" tone="muted" className="mb-3">
              How the current document differs from the last published version.
            </Text>
            <DiffView diffs={unpublishedDiffs} mediaMap={mediaMap} />
          </section>

          <section>
            <Heading level={3} className="mb-3">
              Published versions
            </Heading>
            <ul className="flex flex-col gap-4">
              {versions.map((entry, index) => (
                <VersionEntryCard
                  key={entry.id}
                  entry={entry}
                  diffs={versionDiffs[index]!}
                  mediaMap={mediaMap}
                  resource={resource}
                  documentId={id}
                  canRestore={canRestore}
                  editHref={editHref}
                />
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
