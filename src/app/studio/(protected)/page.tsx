import { ClipboardCheck, FolderKanban, History, Inbox } from "lucide-react";
import type { Metadata } from "next";

import "@/lib/cms/collections";

import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState, Grid, Link, Text } from "@/components/ui";
import { getRecordLabel, listCollections } from "@/lib/cms/collection-config";
import { connectToDatabase } from "@/lib/db";
import { projectTypeOptions } from "@/lib/lead-schema";
import { can } from "@/lib/cms/permissions";
import { roleMeetsMinimum } from "@/lib/cms/roles";
import { requireSessionUser } from "@/lib/cms/session";
import { listRecentActivity } from "@/lib/cms/version-history";
import { Lead } from "@/models/lead";
import type { SessionUser } from "@/types/cms";

export const metadata: Metadata = {
  title: "Dashboard — HubZero Studio",
};

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);

/**
 * Deliberately small (`ARCHITECTURE/19_CMS_FOUNDATION.md` §10) — four cards,
 * each earning its place with real data or an honest empty state, never a
 * placeholder chart or a fabricated metric. "Awaiting review" and "Recent
 * activity" are generic across the collection registry (`listCollections()`)
 * rather than hardcoded to Case Study, so a future collection's review
 * submissions and publishes show up here with no dashboard code change.
 */
export default async function StudioDashboardPage() {
  const user = await requireSessionUser();
  const canViewLeads = can(user, "view", "lead");
  const canSeeReviewQueue = roleMeetsMinimum(user.role, "admin");

  await connectToDatabase();

  const [newLeadsCount, recentLeads, reviewCount, recentActivity] = await Promise.all([
    canViewLeads ? Lead.countDocuments({ status: "new" }) : Promise.resolve(0),
    canViewLeads ? Lead.find().sort({ createdAt: -1 }).limit(5) : Promise.resolve([]),
    canSeeReviewQueue ? countAwaitingReview(user) : Promise.resolve(0),
    listRecentActivity(20),
  ]);

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
              <Text as="span" className="text-h3 text-text font-semibold">
                {newLeadsCount}
              </Text>
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
          {can(user, "view", "caseStudy") ? (
            <EmptyState
              title="Case Studies is live"
              description="Team, Blog, and the rest of the CMS collections roll out on the same engine in later phases."
              action={<Link href="/studio/case-studies">Go to Case Studies →</Link>}
            />
          ) : (
            <EmptyState
              title="Nothing to manage here"
              description="Company portfolio content isn't part of your role's scope."
            />
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
