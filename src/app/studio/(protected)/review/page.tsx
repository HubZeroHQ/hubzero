import type { Metadata } from "next";

import "@/lib/cms/collections";

import { WorkflowStatusBadge } from "@/components/admin/workflow-status-badge";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState, Heading, Link, Text } from "@/components/ui";
import { getRecordLabel, listCollections } from "@/lib/cms/collection-config";
import { can } from "@/lib/cms/permissions";
import { requireSessionUser } from "@/lib/cms/session";
import { serializeDocument } from "@/lib/cms/serialize";
import { connectToDatabase } from "@/lib/db";

export const metadata: Metadata = {
  title: "Review Queue — HubZero Studio",
};

interface ReviewQueueItem {
  id: string;
  label: string;
  updatedAt?: string;
  href: string;
}

interface ReviewQueueGroup {
  resource: string;
  label: string;
  items: ReviewQueueItem[];
}

/**
 * The unified review queue `ARCHITECTURE/19_CMS_FOUNDATION.md` §10 item 2
 * calls for — every `"draft-review-publish"` collection the signed-in user
 * can view, aggregated from the registry (`listCollections()`), not a
 * hardcoded list of collections. Case Study is the only collection
 * exercising this today, but nothing here names it: adding Build,
 * Blueprint, or BlogPost later means this page's `items.length` count
 * changes, not this page's code (the genericity check
 * `ARCHITECTURE/19_CMS_FOUNDATION.md` asks for, applied to a cross-collection
 * screen rather than a single-collection one).
 */
export default async function ReviewQueuePage() {
  const user = await requireSessionUser();
  await connectToDatabase();

  const collections = listCollections().filter(
    (config) => config.workflow === "draft-review-publish" && can(user, "view", config.resource),
  );

  const groups: ReviewQueueGroup[] = await Promise.all(
    collections.map(async (config) => {
      const rawDocs = await config.model.find({ status: "review" }).sort({ updatedAt: -1 }).lean();
      const docs = serializeDocument(rawDocs) as Record<string, unknown>[];

      return {
        resource: config.resource,
        label: config.label,
        items: docs.map((doc) => ({
          id: String(doc._id),
          label: getRecordLabel(config, doc),
          updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : undefined,
          href: config.studioBasePath
            ? `/studio/${config.studioBasePath}/${doc._id}`
            : `/studio/history/${config.resource}/${doc._id}`,
        })),
      };
    }),
  );

  const nonEmptyGroups = groups.filter((group) => group.items.length > 0);
  const totalCount = nonEmptyGroups.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <>
      <PageHeader
        title="Review queue"
        description="Every draft submitted for review, across every collection that requires one."
      />

      {totalCount === 0 ? (
        <EmptyState
          title="Nothing awaiting review"
          description="Submissions from every draft-review-publish collection you can see will show up here."
        />
      ) : (
        <div className="flex flex-col gap-8">
          {nonEmptyGroups.map((group) => (
            <section key={group.resource}>
              <Heading level={3} className="mb-3">
                {group.label}{" "}
                <Text as="span" tone="muted" size="body">
                  ({group.items.length})
                </Text>
              </Heading>
              <ul className="divide-border-muted divide-y">
                {group.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                    <Link href={item.href}>{item.label}</Link>
                    <div className="flex items-center gap-3">
                      <WorkflowStatusBadge status="review" />
                      {item.updatedAt && (
                        <Text size="caption" tone="muted">
                          {new Date(item.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
