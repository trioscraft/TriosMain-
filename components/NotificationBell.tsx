"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types/admin/notifications";
import NotificationDropdown from "@/components/NotificationDropdown";
import UnreadBadge from "@/components/UnreadBadge";
import { getUserNotifications, markAllNotificationsRead } from "@/lib/admin/notifications";

type SupabaseChannel = ReturnType<typeof supabase.channel>;

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const ref = useRef<HTMLDivElement | null>(null);
  const channelRef = useRef<SupabaseChannel | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const id = user?.id ?? "";
      setUserId(id);

      if (!id) return;

      const data = await getUserNotifications(id);
      if (mounted && data) setNotifications(data);

      try {
        channelRef.current = supabase.channel("notifications");

        channelRef.current.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${id}`,
          },
          (payload) => {
            const incoming = payload.new as Notification;
            setNotifications((current) => [incoming, ...current]);
          }
        );

        channelRef.current.subscribe();
      } catch (e) {
        console.warn("Realtime notifications subscription failed:", e);
      }
    }

    void loadNotifications();

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      mounted = false;
      window.removeEventListener("mousedown", handleClickOutside);
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, []);

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  async function handleMarkAllRead() {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifications"
        className="btn"
        style={{
          width: 44,
          height: 44,
          padding: 0,
          borderRadius: "var(--radius-md)",
          background: "var(--glass-bg)",
          backdropFilter: "blur(10px)",
          border: "1px solid var(--glass-border)",
        }}
      >
        <Bell size={18} style={{ color: open ? "var(--accent)" : "var(--text-secondary)" }} />
        <UnreadBadge count={unreadCount} />
      </button>

      <NotificationDropdown
        notifications={notifications}
        open={open}
        onClose={() => setOpen(false)}
        onMarkAllRead={handleMarkAllRead}
      />
    </div>
  );
}
