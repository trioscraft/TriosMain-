"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, ExternalLink } from "lucide-react";
import { Notification } from "@/types/admin/notifications";

export default function NotificationList({
  notifications,
  onMarkAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}) {
  const pathname = usePathname();
  const notificationsHref = pathname.startsWith("/member") ? "/member/notifications" : "/admin/notifications";
  if (notifications.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <span style={{ fontSize: 24 }}>🔔</span>
        </div>
        <span>No notifications found.</span>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="card"
          style={{
            padding: "18px",
            background: notification.is_read ? "var(--glass-bg)" : "var(--accent-soft)",
            borderColor: notification.is_read ? "var(--glass-border)" : "var(--border-accent)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              marginBottom: "10px",
            }}
          >
            <div>
              <strong style={{ display: "block", marginBottom: "6px" }}>{notification.title}</strong>
              <span style={{ color: "var(--text-tertiary)", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Clock size={12} /> {new Date(notification.created_at).toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--text-secondary)",
                textTransform: "capitalize",
              }}
            >
              <span>{notification.type}</span>
              {!notification.is_read && (
                <span className="badge badge-brass" style={{ padding: "2px 9px" }}>
                  New
                </span>
              )}
            </div>
          </div>
          <p style={{ margin: 0, lineHeight: 1.7, color: "var(--text-secondary)" }}>{notification.message}</p>

          <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
            <Link href={notification.related_id || notificationsHref} className="btn btn-ghost" style={{ padding: "8px 12px", fontSize: 13, gap: 6 }}>
              <ExternalLink size={13} /> View details
            </Link>
            {!notification.is_read && (
              <button onClick={() => onMarkAsRead(notification.id)} className="btn" style={{ padding: "8px 12px", fontSize: 13 }}>
                Mark as read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
