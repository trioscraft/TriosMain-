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
import { PageHeader } from "@/components/admin/ui/Card";
import { Input, Select } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";
import RoleGuard from "@/components/RoleGuard";
import { Bell } from "lucide-react";

export default function MemberNotificationsPage() {
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
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: "900px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Notifications"
          subtitle="Review your latest alerts and manage unread items."
          icon={<Bell size={22} />}
          actions={
            <Button variant="ghost" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          }
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "grid", gap: "16px" }}>
            <Input
              aria-label="Search notifications"
              placeholder="Search notifications"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div style={{ display: "flex", gap: "12px" }}>
              <label style={{ flex: 1 }}>
                <span style={{ display: "block", marginBottom: "6px", color: "var(--text-tertiary)" }}>
                  Type
                </span>
                <Select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value="all">All types</option>
                  <option value="task">Task</option>
                  <option value="project">Project</option>
                  <option value="client">Client</option>
                  <option value="invoice">Invoice</option>
                </Select>
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
            className="card"
            style={{
              padding: "20px",
            }}
          >
            <h2 style={{ margin: "0 0 14px", fontSize: 18 }}>Summary</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total</span>
                <strong>{notifications.length}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Unread</span>
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
    </RoleGuard>
  );
}