"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckCheck, Bell } from "lucide-react";
import { Notification } from "@/types/admin/notifications";
import { markNotificationRead } from "@/lib/admin/notifications";

export default function NotificationDropdown({
  notifications,
  open,
  onClose,
  onMarkAllRead,
}: {
  notifications: Notification[];
  open: boolean;
  onClose: () => void;
  onMarkAllRead: () => void;
}) {
  const pathname = usePathname();
  const notificationsHref = pathname.startsWith("/member") ? "/member/notifications" : "/admin/notifications";
  if (!open) return null;

  return (
    <div
      className="glass-strong"
      style={{
        position: "absolute",
        right: 0,
        top: "52px",
        width: "360px",
        maxHeight: "440px",
        overflowY: "auto",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--glass-border-hover)",
        boxShadow: "0 30px 80px -20px rgba(70, 55, 40, 0.4)",
        padding: "16px",
        zIndex: 50,
      }}
      onMouseLeave={onClose}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontFamily: "var(--font-display)", fontWeight: 700 }}>Notifications</h3>
        <button
          onClick={onMarkAllRead}
          className="btn btn-ghost"
          style={{ padding: "6px 10px", fontSize: 12.5, gap: 6 }}
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state" style={{ padding: "32px 16px" }}>
          <div className="empty-state-icon">
            <Bell size={22} />
          </div>
          <span style={{ fontSize: 13.5 }}>No notifications yet.</span>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {notifications.slice(0, 8).map((notification) => (
            <Link
              key={notification.id}
              href={notification.related_id || notificationsHref}
              onClick={async () => {
                await markNotificationRead(notification.id);
                onClose();
              }}
              style={{
                display: "block",
                padding: "12px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--text-primary)",
                background: notification.is_read ? "var(--glass-bg)" : "var(--accent-soft)",
                border: `1px solid ${notification.is_read ? "var(--glass-border)" : "var(--border-accent)"}`,
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--glass-border-hover)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = notification.is_read ? "var(--glass-border)" : "var(--border-accent)")
              }
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "10px",
                  alignItems: "center",
                  marginBottom: "6px",
                }}
              >
                <strong style={{ fontSize: 13.5 }}>{notification.title}</strong>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                  {new Date(notification.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.5 }}>
                {notification.message}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
