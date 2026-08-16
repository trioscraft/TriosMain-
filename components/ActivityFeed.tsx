"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Activity = {
  id: string;
  user_name: string;
  user_id: string;
  action: string;
  project_id?: string | null;
  project_name?: string | null;
  client_id?: string | null;
  client_name?: string | null;
  created_at: string;
};

const actionIcons: Record<string, string> = {
  "created project": "📁",
  "deleted project": "🗑️",
  "created task": "🆕",
  "deleted task": "❌",
  "completed task": "🔥",
  "assigned task": "👤",
  "logged": "⏱",
  "added timer entry": "⏱",
  "added expense": "💸",
  "updated expense": "✏️",
  "deleted expense": "🗑️",
  "created client": "🆕",
  "updated client": "✏️",
  "deleted client": "🗑️",
  "linked to client": "🔗",
};

function getActivityIcon(action: string) {
  const lower = action.toLowerCase();
  if (lower.includes("deleted project")) return actionIcons["deleted project"];
  if (lower.includes("created project")) return actionIcons["created project"];
  if (lower.includes("created task")) return actionIcons["created task"];
  if (lower.includes("deleted task")) return actionIcons["deleted task"];
  if (lower.includes("completed task")) return actionIcons["completed task"];
  if (lower.includes("assigned task")) return actionIcons["assigned task"];
  if (lower.includes("logged")) return actionIcons["logged"];
  if (lower.includes("timer")) return actionIcons["added timer entry"];
  if (lower.includes("added expense")) return actionIcons["added expense"];
  if (lower.includes("updated expense")) return actionIcons["updated expense"];
  if (lower.includes("deleted expense")) return actionIcons["deleted expense"];
  if (lower.includes("created client")) return actionIcons["created client"];
  if (lower.includes("updated client")) return actionIcons["updated client"];
  if (lower.includes("deleted client")) return actionIcons["deleted client"];
  if (lower.includes("linked to client")) return actionIcons["linked to client"];
  return "📌";
}

function formatTimeAgo(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

export default function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadActivities() {
      setLoading(true);
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (isMounted) {
        setActivities(data || []);
        setLoading(false);
      }

      if (error) {
        console.error("Failed to load activity feed:", error);
      }
    }

    loadActivities();

    const channel = supabase
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activities" },
        (payload) => {
          const newActivity = payload.new as Activity;
          setActivities((current) => [newActivity, ...current].slice(0, 20));
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div
      className="card"
      style={{
        padding: "24px",
        marginTop: "32px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "18px",
              fontWeight: 700,
            }}
          >
            Activity Feed
          </div>
          <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
            Latest updates from your team.
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: "12px" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              style={{
                height: "72px",
                borderRadius: "14px",
                background: "rgba(255,255,255,0.04)",
                animation: "pulse 1.2s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "28px",
            textAlign: "center",
            color: "var(--text-tertiary)",
          }}
        >
          No activity yet. Your actions will appear here soon.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "14px",
                padding: "16px 18px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "12px",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  fontSize: "18px",
                }}
              >
                {getActivityIcon(activity.action)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--text-primary)",
                  }}
                >
                  {activity.user_name} {activity.action}
                </div>
                <div
                  style={{
                    marginTop: "6px",
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    color: "var(--text-tertiary)",
                    fontSize: "12px",
                  }}
                >
                  {activity.project_name ? (
                    <>
                      <span>Project: {activity.project_name}</span>
                      <span>•</span>
                    </>
                  ) : null}
                  {activity.client_name ? (
                    <>
                      <span>Client: {activity.client_name}</span>
                      <span>•</span>
                    </>
                  ) : null}
                  <span>{formatTimeAgo(activity.created_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
