"use client";

import Link from "next/link";
import { Notification } from "@/types/admin/notifications";

export default function NotificationList({
  notifications,
  onMarkAsRead,
}: {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div
        style={{
          padding: "24px",
          borderRadius: "18px",
          background: "rgba(255,255,255,0.03)",
          color: "var(--text-secondary)",
        }}
      >
        No notifications found.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "14px" }}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            padding: "18px",
            borderRadius: "18px",
            background: notification.is_read
              ? "rgba(255,255,255,0.04)"
              : "rgba(94, 111, 255, 0.14)",
            border: "1px solid rgba(255,255,255,0.08)",
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
              <strong style={{ display: "block", marginBottom: "6px" }}>
                {notification.title}
              </strong>
              <span style={{ color: "var(--text-tertiary)", fontSize: "13px" }}>
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              <span>{notification.type}</span>
              {!notification.is_read && (
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "var(--accent)",
                    color: "white",
                  }}
                >
                  New
                </span>
              )}
            </div>
          </div>
          <p style={{ margin: 0, lineHeight: 1.7, color: "var(--text-secondary)" }}>
            {notification.message}
          </p>

          <div style={{ marginTop: "14px", display: "flex", gap: "10px" }}>
            <Link
              href={notification.related_id || "/admin/notifications"}
              style={{
                color: "var(--accent)",
                textDecoration: "underline",
              }}
            >
              View details
            </Link>
            {!notification.is_read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                style={{
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: "white",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
