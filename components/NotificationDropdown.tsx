"use client";

import Link from "next/link";
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
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "48px",
        width: "340px",
        maxHeight: "420px",
        overflowY: "auto",
        background: "rgba(6, 6, 15, 0.96)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
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
          marginBottom: "12px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px" }}>Notifications</h3>
        <button
          onClick={onMarkAllRead}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            padding: "6px 12px",
            borderRadius: "12px",
            cursor: "pointer",
          }}
        >
          Mark all read
        </button>
      </div>

      {notifications.length === 0 ? (
        <p style={{ margin: 0, color: "var(--text-tertiary)" }}>
          No notifications yet.
        </p>
      ) : (
        notifications.slice(0, 8).map((notification) => (
          <Link
            key={notification.id}
            href={notification.related_id || "/admin/notifications"}
            onClick={async () => {
              await markNotificationRead(notification.id);
              onClose();
            }}
            style={{
              display: "block",
              padding: "12px",
              borderRadius: "14px",
              textDecoration: "none",
              color: "white",
              background: notification.is_read
                ? "rgba(255,255,255,0.02)"
                : "rgba(94, 111, 255, 0.16)",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong>{notification.title}</strong>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                }}
              >
                {new Date(notification.created_at).toLocaleString()}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                color: "var(--text-secondary)",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {notification.message}
            </p>
          </Link>
        ))
      )}
    </div>
  );
}
