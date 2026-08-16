"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  getUserNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/admin/notifications";
import NotificationList from "@/components/NotificationList";
import { Notification } from "@/types/admin/notifications";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [userId, setUserId] = useState("");
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const id = user?.id ?? "";
      setUserId(id);
      if (!id) {
        return;
      }

      const data = await getUserNotifications(id);
      if (mounted && data) {
        setNotifications(data);
      }

      channelRef.current = supabase
        .channel("notifications-page")
        .on(
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
        )
        .subscribe();
    }

    void loadNotifications();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (showUnreadOnly && notification.is_read) {
        return false;
      }

      if (typeFilter !== "all" && notification.type !== typeFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          notification.title.toLowerCase().includes(q) ||
          notification.message.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [notifications, search, showUnreadOnly, typeFilter]);

  async function handleMarkAllRead() {
    if (!userId) {
      return;
    }

    await markAllNotificationsRead(userId);
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  async function handleMarkAsRead(id: string) {
    await markNotificationRead(id);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification
      )
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>Notifications</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            Review your latest alerts and manage unread items.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={handleMarkAllRead}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "white",
              padding: "12px 18px",
              borderRadius: "14px",
              cursor: "pointer",
            }}
          >
            Mark all read
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: "24px",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "grid", gap: "16px" }}>
          <input
            aria-label="Search notifications"
            placeholder="Search notifications"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "var(--bg-elevated)",
              color: "white",
            }}
          />

          <div style={{ display: "flex", gap: "12px" }}>
            <label style={{ flex: 1 }}>
              <span style={{ display: "block", marginBottom: "6px", color: "var(--text-tertiary)" }}>
                Type
              </span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "var(--bg-elevated)",
                  color: "white",
                }}
              >
                <option value="all">All types</option>
                <option value="task">Task</option>
                <option value="project">Project</option>
                <option value="client">Client</option>
                <option value="invoice">Invoice</option>
              </select>
            </label>
          </div>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--text-secondary)",
            }}
          >
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(event) => setShowUnreadOnly(event.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            Show unread only
          </label>
        </div>

        <div
          style={{
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "20px",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <h2 style={{ margin: "0 0 14px" }}>Summary</h2>
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Total</span>
              <strong>{notifications.length}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Unread</span>
              <strong>{notifications.filter((n) => !n.is_read).length}</strong>
            </div>
          </div>
        </div>
      </div>

      <NotificationList
        notifications={filteredNotifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
}
