"use server";

import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type ClientNotification,
} from "@/lib/cms/notifications";
import { requireSessionUser } from "@/lib/cms/session";

export async function getMyNotifications(): Promise<ClientNotification[]> {
  const user = await requireSessionUser();
  return listNotifications(user.id);
}

export async function getMyUnreadNotificationCount(): Promise<number> {
  const user = await requireSessionUser();
  return getUnreadCount(user.id);
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const user = await requireSessionUser();
  await markNotificationRead(id, user.id);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireSessionUser();
  await markAllNotificationsRead(user.id);
}
