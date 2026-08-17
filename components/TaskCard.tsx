"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import EditTaskModal, { TaskData } from "@/components/EditTaskModal";
import DeleteTaskButton from "@/app/admin/projects/[id]/DeleteTaskButton";
import TaskAssignee from "@/app/admin/projects/[id]/TaskAssignee";
import UpdateTaskProgress from "@/app/admin/projects/[id]/UpdateTaskProgress";

export default function TaskCard({
  task,
  projectId,
  projectName,
}: {
  task: TaskData;
  projectId: string;
  projectName: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="card"
      style={{
        padding: "18px 20px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
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
                fontWeight: 500,
                fontSize: "14px",
                textDecoration: task.status === "completed" ? "line-through" : "none",
                color: task.status === "completed" ? "var(--text-tertiary)" : "var(--text-primary)",
              }}
            >
              {task.title}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            className={`badge ${
              task.status === "completed"
                ? "badge-green"
                : task.status === "active"
                ? "badge-blue"
                : "badge-amber"
            }`}
          >
            {task.status}
          </span>

          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--accent)",
              minWidth: "36px",
              textAlign: "right",
            }}
          >
            {task.progress}%
          </span>

          <div style={{ position: "relative" }}>
            <button className="btn" onClick={() => setMenuOpen((value) => !value)} style={{ padding: "6px 10px", minWidth: "42px" }} aria-label="Task actions">
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div
                className="glass-strong"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "110%",
                  width: "180px",
                  borderRadius: "14px",
                  border: "1px solid var(--glass-border-hover)",
                  boxShadow: "0 18px 40px rgba(70, 55, 40, 0.25)",
                  zIndex: 20,
                  padding: "8px",
                }}
              >
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setIsEditing(true);
                    setMenuOpen(false);
                  }}
                  style={{ width: "100%", justifyContent: "flex-start", padding: "10px 12px", gap: 8 }}
                >
                  <Pencil size={14} /> Edit task
                </button>

                <div style={{ paddingTop: 8 }}>
                  <DeleteTaskButton
                    taskId={task.id}
                    taskTitle={task.title}
                    projectId={projectId}
                    projectName={projectName}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${task.progress}%`,
              background: task.status === "completed" ? "var(--green)" : "var(--accent)",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        <TaskAssignee
          taskId={task.id}
          taskTitle={task.title || "Untitled task"}
          projectId={projectId}
          projectName={projectName}
        />

        <UpdateTaskProgress
          taskId={task.id}
          taskTitle={task.title || "Untitled task"}
          projectId={projectId}
          projectName={projectName}
        />
      </div>

      <EditTaskModal
        open={isEditing}
        task={task}
        projectId={projectId}
        projectName={projectName}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
