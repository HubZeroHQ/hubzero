import { FolderKanban, Inbox } from "lucide-react";
import type { Metadata } from "next";

import { DashboardCard } from "@/components/admin/dashboard/dashboard-card";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState, Grid, Link, Text } from "@/components/ui";
import { connectToDatabase } from "@/lib/db";
import { projectTypeOptions } from "@/lib/lead-schema";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { Lead } from "@/models/lead";

export const metadata: Metadata = {
  title: "Dashboard — HubZero Studio",
};

const projectTypeLabels = Object.fromEntries(
  projectTypeOptions.map((option) => [option.value, option.label]),
);

/**
 * Kept deliberately small (`ARCHITECTURE/19_CMS_FOUNDATION.md` §10 — full
 * scope, including the review queue and recent-activity feed, is Phase C/F,
 * once version history and more collections exist). The one card that earns
 * its place today is Leads: the `Lead` collection already exists and is
 * real, time-sensitive data, so this reads it directly rather than
 * fabricating a metric. Every other future collection gets an honest
 * "doesn't exist yet" card, not a placeholder chart.
 */
export default async function StudioDashboardPage() {
  const user = await requireSessionUser();
  const canViewLeads = can(user, "view", "lead");

  await connectToDatabase();
  const [newLeadsCount, recentLeads] = canViewLeads
    ? await Promise.all([
        Lead.countDocuments({ status: "new" }),
        Lead.find().sort({ createdAt: -1 }).limit(5),
      ])
    : [0, []];

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
      </Grid>
    </>
  );
}
