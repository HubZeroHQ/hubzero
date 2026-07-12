"use client";

import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  getMyNotifications,
  getMyUnreadNotificationCount,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/actions/studio/notifications";
import { Text } from "@/components/ui/text";
import type { ClientNotification } from "@/lib/cms/notifications";
import { cn } from "@/lib/utils";

/**
 * The notification bell (Phase E) — a plain, hand-rolled dropdown (no
 * `@radix-ui/react-dropdown-menu`/popover dependency exists in this project
 * yet, and one screen doesn't warrant adding one) rather than a new heavy
 * dependency. Polls the unread count on an interval so the badge stays
 * current without a websocket, appropriate at this app's scale (a five-person
 * team, `ARCHITECTURE/19_CMS_FOUNDATION.md` §10's own framing).
 */
export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMyUnreadNotificationCount().then(setUnreadCount);
    const interval = setInterval(() => {
      getMyUnreadNotificationCount().then(setUnreadCount);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Moves focus into the panel on open, matching the command palette's
  // `onOpenAutoFocus` — otherwise a keyboard user has no way to reach the
  // panel's contents except tabbing past whatever follows the bell in the
  // topbar.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      getMyNotifications().then(setNotifications);
    }
  }

  async function handleSelect(notification: ClientNotification) {
    if (!notification.read) {
      await markNotificationReadAction(notification.id);
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    setOpen(false);
    if (notification.link) router.push(notification.link);
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => handleOpenChange(!open)}
        aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="text-text-muted hover:text-text relative inline-flex size-8 items-center justify-center rounded-md"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="bg-danger text-bg absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full text-[10px] font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Notifications"
          tabIndex={-1}
          className="bg-bg-light border-border-muted z-modal absolute right-0 mt-2 w-[min(22rem,90vw)] rounded-lg border shadow-xl focus:outline-none"
        >
          <div className="border-border-muted flex items-center justify-between border-b px-4 py-3">
            <Text weight="medium">Notifications</Text>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-caption text-text-muted hover:text-text"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <Text size="caption" tone="muted" className="px-4 py-6 text-center">
                No notifications yet.
              </Text>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id} role="none">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => handleSelect(notification)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-4 py-3 text-left",
                        notification.read ? "text-text-muted" : "text-text bg-accent/5",
                        "hover:bg-bg",
                      )}
                    >
                      <Text size="caption" weight={notification.read ? undefined : "medium"}>
                        {notification.title}
                      </Text>
                      {notification.body && (
                        <Text size="caption" tone="muted" className="line-clamp-2">
                          {notification.body}
                        </Text>
                      )}
                      <Text size="caption" tone="muted">
                        {new Date(notification.createdAt).toLocaleString()}
                      </Text>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
