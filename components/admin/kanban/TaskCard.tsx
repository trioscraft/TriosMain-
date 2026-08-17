"use client";

import { KanbanTask } from "@/types/admin/kanban";

function formatDueDate(due: string | null | undefined) {
  if (!due) return "—";
  try {
    const dt = new Date(due);
    return dt.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return due;
  }
}

export default function TaskCard({
  task,
  compact,
}: {
  task: KanbanTask;
  compact?: boolean;
}) {
  return (
    <div
      className="card"
      style={{
        padding: compact ? "12px 14px" : "16px 18px",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            marginTop: 6,
            background:
              task.status === "completed"
                ? "var(--green)"
                : task.progress > 0
                  ? "var(--accent)"
                  : "var(--bg-elevated)",
            border:
              task.status === "completed" || task.progress > 0
                ? "none"
                : "2px solid var(--border-hover)",
            flexShrink: 0,
          }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: compact ? 13 : 14,
              fontWeight: 650,
              color:
                task.status === "completed"
                  ? "var(--text-tertiary)"
                  : "var(--text-primary)",
              textDecoration:
                task.status === "completed" ? "line-through" : "none",
              wordBreak: "break-word",
            }}
          >
            {task.title}
          </div>

          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
              gap: 10,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Assignee
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                {task.assigned_name || "Unassigned"}
              </div>
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Due
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                {formatDueDate(task.due_date)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 11, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Progress
              </div>
              <div style={{ fontSize: 12, color: task.status === "completed" ? "var(--green)" : "var(--accent)", fontWeight: 700 }}>
                {task.progress}%
              </div>
            </div>
            <div style={{ marginTop: 6, height: 8, background: "var(--bg-elevated)", borderRadius: 999, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${task.progress}%`,
                  background:
                    task.status === "completed"
                      ? "linear-gradient(90deg, var(--green), rgba(126,161,135,0.6))"
                      : "linear-gradient(90deg, var(--accent), var(--purple))",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

