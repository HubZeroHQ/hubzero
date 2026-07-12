import { Types } from "mongoose";

import { can } from "@/lib/cms/permissions";
import { connectToDatabase } from "@/lib/db";
import { Notification } from "@/models/notification";
import { User } from "@/models/user";
import type { Action, Resource } from "@/types/cms";

/**
 * The registry-driven half of the notification system (Phase E) — every
 * event this app fires is one entry here, so `notify()` (below) and the
 * eventual UI both work off one closed, documented vocabulary rather than
 * ad hoc string literals scattered at each call site.
 */
export const NOTIFICATION_EVENTS = {
  review_requested: { label: "Review requested" },
  document_approved: { label: "Document approved" },
  publish_completed: { label: "Publish completed" },
  lead_assigned: { label: "Lead assigned" },
  password_reset: { label: "Password reset" },
  media_deleted: { label: "Media deleted" },
  comment_mention: { label: "Comment mention" },
} as const;

export type NotificationEvent = keyof typeof NOTIFICATION_EVENTS;

export interface ClientNotification {
  id: string;
  type: NotificationEvent;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface NotifyInput {
  userId: string;
  event: NotificationEvent;
  title: string;
  body?: string;
  link?: string;
  sourceCollection?: Resource;
  sourceDocumentId?: string;
}

/**
 * The one write path every event call-site uses (`crud-actions.ts`'s
 * `submitForReview`/`approve`/`publish`, `actions/studio/leads.ts`'s
 * `assignLead`, `actions/studio/users.ts`'s `resetUserPassword`,
 * `actions/studio/media.ts`'s `deleteMediaAction`, `lib/cms/comments.ts`'s
 * `createComment`) — each is a call at the exact point that event already
 * happens, never new business logic duplicated elsewhere.
 */
export async function notify(input: NotifyInput): Promise<void> {
  await connectToDatabase();
  await Notification.create({
    userId: new Types.ObjectId(input.userId),
    type: input.event,
    title: input.title,
    body: input.body,
    link: input.link,
    sourceCollection: input.sourceCollection,
    sourceDocumentId: input.sourceDocumentId
      ? new Types.ObjectId(input.sourceDocumentId)
      : undefined,
  });
}

export async function notifyMany(
  userIds: string[],
  rest: Omit<NotifyInput, "userId">,
): Promise<void> {
  await Promise.all(userIds.map((userId) => notify({ ...rest, userId })));
}

/**
 * Every account holding a given permission grant — reuses `can()` directly
 * rather than a second per-user permission query, since role +
 * `dynamicPermissions` (already on every `User` document) is all `can()`
 * needs. Used to find "who should be notified a document needs review"
 * without a bespoke reviewer-list concept.
 */
export async function getUsersWithPermission(
  action: Action,
  resource: Resource,
): Promise<string[]> {
  await connectToDatabase();
  const users = await User.find()
    .select("role dynamicPermissions")
    .lean<
      {
        _id: Types.ObjectId;
        role: "head_admin" | "admin" | "teammate";
        dynamicPermissions: string[];
      }[]
    >();

  return users
    .filter((user) =>
      can(
        {
          id: String(user._id),
          email: "",
          name: "",
          role: user.role,
          dynamicPermissions: user.dynamicPermissions ?? [],
        },
        action,
        resource,
      ),
    )
    .map((user) => String(user._id));
}

const NOTIFICATIONS_PAGE_SIZE = 20;

export async function listNotifications(userId: string): Promise<ClientNotification[]> {
  await connectToDatabase();
  const docs = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(NOTIFICATIONS_PAGE_SIZE)
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    type: doc.type as NotificationEvent,
    title: doc.title,
    body: doc.body ?? undefined,
    link: doc.link ?? undefined,
    read: doc.read,
    createdAt: new Date(doc.createdAt).toISOString(),
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  await connectToDatabase();
  return Notification.countDocuments({ userId, read: false });
}

export async function markNotificationRead(id: string, userId: string): Promise<void> {
  await connectToDatabase();
  await Notification.updateOne({ _id: id, userId }, { $set: { read: true } });
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await connectToDatabase();
  await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
}
