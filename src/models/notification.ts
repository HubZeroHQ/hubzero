import { Schema, type InferSchemaType, type Types } from "mongoose";

import { defineModel } from "@/models/shared/define-model";

/**
 * One notification, targeted at exactly one user — `type` is a
 * `NotificationEvent` key (`lib/cms/notifications.ts`), kept as a plain
 * `String` rather than importing that union here for the same "this model
 * must stay importable from anywhere without pulling in the event registry
 * as a schema dependency" reason `version-history.ts`/`comment.ts` keep
 * `collection` as a plain string. `sourceCollection`/`sourceDocumentId` are
 * optional — some events (password reset) have no underlying document.
 */
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String },
    link: { type: String },
    read: { type: Boolean, required: true, default: false },
    sourceCollection: { type: String },
    sourceDocumentId: { type: Schema.Types.ObjectId },
  },
  { timestamps: true, versionKey: false },
);

// "This user's notifications, newest first" (the bell dropdown) and "this
// user's unread count" (the bell badge) are the only two read patterns.
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: Types.ObjectId;
};

export const Notification = defineModel<NotificationDocument>("Notification", notificationSchema);
