import {
  AlertTriangle,
  CalendarClock,
  ClipboardCheck,
  FolderKanban,
  HardDrive,
  History,
  Inbox,
  UploadCloud,
} from "lucide-react";
import type { Metadata } from "next";

import "@/lib/cms/collections";

import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState, Grid, Link, Text } from "@/components/ui";
import type { AnyCollectionConfig } from "@/lib/cms/collection-config";
import { getRecordLabel, listCollections } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { projectTypeOptions } from "@/lib/lead-schema";
import { findBrokenMediaReferences, getStorageUsageSummary, listMedia } from "@/lib/cms/media";
import { can } from "@/lib/cms/permissions";
import { roleMeetsMinimum } from "@/lib/cms/roles";
import { listUpcomingPublishes, listUpcomingUnpublishes } from "@/lib/cms/scheduler";
import { requireSessionUser } from "@/lib/cms/session";
import { listRecentActivity } from "@/lib/cms/version-history";
import { formatBytes } from "@/lib/utils";
import { Lead } from "@/models/lead";
import type { SessionUser } from "@/types/cms";

export const metadata: Metadata = {
  title: "Dashboard — HubZero Studio",
};

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);

/**
 * Each card earns its place with real data or an honest empty state, never a
 * placeholder chart or a fabricated metric (`ARCHITECTURE/19_CMS_FOUNDATION.md`
 * §10). "Awaiting review," "Recent activity," "Content," "Draft counts," and
 * media-related cards are generic across the collection registry
 * (`listCollections()`) rather than hardcoded to Case Study, so a future
 * collection shows up everywhere it belongs with no dashboard code change.
 *
 * "Recent activity" below already *is* "recent publishes" — `VersionHistory`
 * entries are only ever written from `publish()` (`version-history.ts`'s
 * `snapshotVersion` header comment), so a separate "recent publishes" card
 * would just duplicate it under a second label; this dashboard doesn't add
 * one.
 */
export default async function StudioDashboardPage() {
  const user = await requireSessionUser();
  const canViewLeads = can(user, "view", "lead");
  const canSeeReviewQueue = roleMeetsMinimum(user.role, "admin");
  const canViewMedia = can(user, "view", "media");

  await connectToDatabase();

  const [
    newLeadsCount,
    recentLeads,
    reviewCount,
    recentActivity,
    contentOverview,
    draftOverview,
    recentUploads,
    storageUsage,
    brokenMedia,
    upcomingPublishes,
    upcomingUnpublishes,
  ] = await Promise.all([
    canViewLeads ? Lead.countDocuments({ status: "new" }) : Promise.resolve(0),
    canViewLeads ? Lead.find().sort({ createdAt: -1 }).limit(5) : Promise.resolve([]),
    canSeeReviewQueue ? countAwaitingReview(user) : Promise.resolve(0),
    listRecentActivity(20),
    getContentOverview(user),
    getDraftOverview(user),
    canViewMedia ? listMedia({ sort: "newest", page: 1 }) : Promise.resolve(null),
    canViewMedia ? getStorageUsageSummary() : Promise.resolve(null),
    canViewMedia ? findBrokenMediaReferences() : Promise.resolve([]),
    listUpcomingPublishes(5),
    listUpcomingUnpublishes(5),
  ]);

  // Same "no second permission model" filtering `visibleActivity` below
  // already applies, extended to the two scheduling cards — a document's
  // resource might not be one the signed-in user holds a `view` grant on.
  const visibleUpcomingPublishes = upcomingPublishes.filter((row) =>
    can(user, "view", row.resource),
  );
  const visibleUpcomingUnpublishes = upcomingUnpublishes.filter((row) =>
    can(user, "view", row.resource),
  );

  // `listRecentActivity` reads across every collection; only surface entries
  // for a collection the signed-in user actually holds a `view` grant on —
  // the same "no second permission model" discipline `can()` already applies
  // everywhere else, just filtered client-of-the-query-side instead of in it.
  const visibleActivity = recentActivity
    .filter((entry) => can(user, "view", entry.collection))
    .slice(0, 10);

  return (
    <>
      <PageHeader title="Dashboard" description={`Welcome back, ${user.name.split(" ")[0]}.`} />

      <Grid cols={1} colsMd={2} gap="lg">
        <DashboardCard title="New leads" icon={Inbox}>
          {!canViewLeads ? (
            <EmptyState
              title="Nothing to manage here"
              description="Contact submissions aren't part of your role's scope."
            />
          ) : recentLeads.length === 0 ? (
            <EmptyState
              title="No leads yet"
              description="Contact form submissions will show up here as they come in."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Text as="span" className="text-h3 text-text font-semibold">
                  {newLeadsCount}
                </Text>
                <Link href="/studio/leads">Open inbox →</Link>
              </div>
              <ul className="divide-border-muted -mt-1 divide-y">
                {recentLeads.map((lead) => (
                  <li
                    key={lead._id.toString()}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <Text weight="medium">{lead.name}</Text>
                      <Text size="caption" tone="muted">
                        {projectTypeLabels[lead.projectType] ?? lead.projectType}
                      </Text>
                    </div>
                    <Text size="caption" tone="muted">
                      {new Date(lead.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Content" icon={FolderKanban}>
          {contentOverview.length === 0 ? (
            <EmptyState
              title="Nothing to manage here"
              description="Content collections aren't part of your role's scope."
            />
          ) : (
            <ul className="divide-border-muted -mt-1 divide-y">
              {contentOverview.map(({ config, total }) => (
                <li
                  key={config.resource}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <Text weight="medium">{config.label}</Text>
                  <div className="flex items-center gap-3">
                    <Text size="caption" tone="muted">
                      {total} {total === 1 ? "item" : "items"}
                    </Text>
                    {config.studioBasePath && (
                      <Link href={`/studio/${config.studioBasePath}`}>Open →</Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Awaiting review" icon={ClipboardCheck}>
          {!canSeeReviewQueue ? (
            <EmptyState
              title="Nothing to manage here"
              description="Reviewing submitted drafts isn't part of your role's scope."
            />
          ) : reviewCount === 0 ? (
            <EmptyState
              title="Queue is empty"
              description="Nothing is waiting on a review right now."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <Text as="span" className="text-h3 text-text font-semibold">
                {reviewCount}
              </Text>
              <Link href="/studio/review">Go to the review queue →</Link>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Recent activity" icon={History}>
          {visibleActivity.length === 0 ? (
            <EmptyState
              title="No activity yet"
              description="Publishes across every collection show up here as they happen."
            />
          ) : (
            <ul className="divide-border-muted -mt-1 divide-y">
              {visibleActivity.map((entry) => {
                const config = listCollections().find((item) => item.resource === entry.collection);
                return (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <Text weight="medium">{getRecordLabel(config, entry.snapshot)}</Text>
                      <Text size="caption" tone="muted">
                        Published by {entry.editedBy?.name ?? "an unknown user"}
                        {config ? ` · ${config.label}` : ""}
                      </Text>
                    </div>
                    <Text size="caption" tone="muted">
                      {new Date(entry.editedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Draft counts" icon={FolderKanban}>
          {draftOverview.length === 0 ? (
            <EmptyState
              title="Nothing to manage here"
              description="Content collections aren't part of your role's scope."
            />
          ) : draftOverview.every((row) => row.total === 0) ? (
            <EmptyState title="No drafts" description="Nothing is sitting in draft right now." />
          ) : (
            <ul className="divide-border-muted -mt-1 divide-y">
              {draftOverview
                .filter((row) => row.total > 0)
                .map(({ config, total }) => (
                  <li
                    key={config.resource}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <Text weight="medium">{config.label}</Text>
                    <div className="flex items-center gap-3">
                      <Text size="caption" tone="muted">
                        {total} {total === 1 ? "draft" : "drafts"}
                      </Text>
                      {config.studioBasePath && (
                        <Link href={`/studio/${config.studioBasePath}`}>Open →</Link>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Recent uploads" icon={UploadCloud}>
          {!canViewMedia ? (
            <EmptyState
              title="Nothing to manage here"
              description="The media library isn't part of your role's scope."
            />
          ) : !recentUploads || recentUploads.items.length === 0 ? (
            <EmptyState
              title="No uploads yet"
              description="Files uploaded anywhere in Studio show up here."
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-5 gap-2">
                {recentUploads.items.slice(0, 5).map((media) => (
                  <MediaThumbnail key={media.id} media={media} className="aspect-square w-full" />
                ))}
              </div>
              <Link href="/studio/media">Open the media library →</Link>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Storage usage" icon={HardDrive}>
          {!canViewMedia ? (
            <EmptyState
              title="Nothing to manage here"
              description="The media library isn't part of your role's scope."
            />
          ) : !storageUsage || storageUsage.count === 0 ? (
            <EmptyState title="Nothing stored yet" description="Upload a file to get started." />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Text as="span" className="text-h3 text-text font-semibold">
                  {formatBytes(storageUsage.totalBytes)}
                </Text>
                <Text size="caption" tone="muted">
                  {storageUsage.count} {storageUsage.count === 1 ? "file" : "files"}
                </Text>
              </div>
              <ul className="divide-border-muted -mt-1 divide-y">
                {storageUsage.byResourceType.map((row) => (
                  <li
                    key={row.resourceType}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <Text weight="medium" className="capitalize">
                      {row.resourceType}
                    </Text>
                    <Text size="caption" tone="muted">
                      {formatBytes(row.bytes)} · {row.count}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Broken media" icon={AlertTriangle}>
          {!canViewMedia ? (
            <EmptyState
              title="Nothing to manage here"
              description="The media library isn't part of your role's scope."
            />
          ) : brokenMedia.length === 0 ? (
            <EmptyState
              title="Nothing broken"
              description="Every image/document field resolves to a real file."
            />
          ) : (
            <ul className="divide-border-muted -mt-1 divide-y">
              {brokenMedia.slice(0, 8).map((entry, index) => {
                const config = listCollections().find(
                  (candidate) => candidate.resource === entry.resource,
                );
                return (
                  <li
                    key={`${entry.documentId}-${entry.field}-${index}`}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <Text weight="medium">{entry.documentLabel}</Text>
                      <Text size="caption" tone="muted">
                        {entry.label} · missing reference on &ldquo;{entry.field}&rdquo;
                      </Text>
                    </div>
                    {config?.studioBasePath && (
                      <Link href={`/studio/${config.studioBasePath}/${entry.documentId}`}>
                        Fix →
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Upcoming publishes" icon={CalendarClock}>
          {visibleUpcomingPublishes.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              description="Documents scheduled to publish in the future show up here."
            />
          ) : (
            <ul className="divide-border-muted -mt-1 divide-y">
              {visibleUpcomingPublishes.map((row) => (
                <li
                  key={`${row.resource}-${row.documentId}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <Text weight="medium">{row.recordLabel}</Text>
                    <Text size="caption" tone="muted">
                      {row.label} · publishes {new Date(row.at).toLocaleString()}
                    </Text>
                  </div>
                  {row.studioBasePath && (
                    <Link href={`/studio/${row.studioBasePath}/${row.documentId}`}>Open →</Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Scheduled changes" icon={CalendarClock}>
          {visibleUpcomingUnpublishes.length === 0 ? (
            <EmptyState
              title="Nothing scheduled"
              description="Published documents scheduled to unpublish in the future show up here."
            />
          ) : (
            <ul className="divide-border-muted -mt-1 divide-y">
              {visibleUpcomingUnpublishes.map((row) => (
                <li
                  key={`${row.resource}-${row.documentId}`}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <Text weight="medium">{row.recordLabel}</Text>
                    <Text size="caption" tone="muted">
                      {row.label} · unpublishes {new Date(row.at).toLocaleString()}
                    </Text>
                  </div>
                  {row.studioBasePath && (
                    <Link href={`/studio/${row.studioBasePath}/${row.documentId}`}>Open →</Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>
      </Grid>
    </>
  );
}

async function countAwaitingReview(user: SessionUser): Promise<number> {
  const collections = listCollections().filter(
    (config) => config.workflow === "draft-review-publish" && can(user, "view", config.resource),
  );
  const counts = await Promise.all(
    collections.map((config) => config.model.countDocuments({ status: "review" })),
  );
  return counts.reduce((sum, count) => sum + count, 0);
}

interface ContentOverviewRow {
  config: AnyCollectionConfig;
  total: number;
}

/**
 * Real per-collection counts, generic across the registry — the same
 * "no fabricated metric" discipline `listRecentActivity`/`countAwaitingReview`
 * already apply, extended to the dashboard's "how much content exists"
 * question now that Phase D gives most collections real data instead of
 * being the one hardcoded "Case Studies is live" placeholder card. Adding an
 * eleventh collection means one more row here, no dashboard code change.
 */
async function getContentOverview(user: SessionUser): Promise<ContentOverviewRow[]> {
  const collections = listCollections().filter(
    // `lead` is registered for its `list()`/`getOne()`/`remove()` reuse
    // (`lib/cms/collections/lead.config.ts`), not because Leads are
    // "content" alongside Case Studies/Notes/etc. — it already has its own
    // dedicated "New leads" card above, so it's excluded here to avoid
    // showing the same count twice under two different framings. `user` is
    // registered for the same list/getOne/remove reuse
    // (`lib/cms/collections/user.config.ts`) — accounts aren't "content"
    // either, so it's excluded for the identical reason.
    (config) =>
      config.resource !== "lead" &&
      config.resource !== "user" &&
      can(user, "view", config.resource),
  );
  const totals = await Promise.all(collections.map((config) => config.model.countDocuments()));
  return collections.map((config, index) => ({ config, total: totals[index] ?? 0 }));
}

/**
 * Real per-collection draft counts — every workflow collection has a
 * `"draft"` status regardless of whether its workflow is `draft-publish` or
 * `draft-review-publish` (`models/shared/workflow-fields.ts`), so this needs
 * no per-workflow branching. Same registry-driven, no-fabricated-metric
 * posture as `getContentOverview`/`countAwaitingReview`.
 */
async function getDraftOverview(user: SessionUser): Promise<ContentOverviewRow[]> {
  const collections = listCollections().filter(
    (config) =>
      config.workflow !== "none" &&
      config.resource !== "lead" &&
      config.resource !== "user" &&
      can(user, "view", config.resource),
  );
  const totals = await Promise.all(
    collections.map((config) => config.model.countDocuments({ status: "draft" })),
  );
  return collections.map((config, index) => ({ config, total: totals[index] ?? 0 }));
}
