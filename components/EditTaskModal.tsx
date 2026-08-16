"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export type TaskData = {
  id: string;
  title: string;
  status: string;
  progress: number;
  assigned_to: string | null;
};

type EditTaskModalProps = {
  open: boolean;
  task: TaskData;
  projectId: string;
  projectName: string;
  onClose: () => void;
};

type Profile = {
  id: string;
  name: string;
};

export default function EditTaskModal({
  open,
  task,
  projectId,
  projectName,
  onClose,
}: EditTaskModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(task.title || "");
  const [status, setStatus] = useState(task.status || "todo");
  const [progress, setProgress] = useState(task.progress || 0);
  const [assignee, setAssignee] = useState(task.assigned_to || "");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const t = window.setTimeout(() => {
      setTitle(task.title || "");
      setStatus(task.status || "todo");
      setProgress(task.progress || 0);
      setAssignee(task.assigned_to || "");
    }, 0);

    return () => window.clearTimeout(t);
  }, [open, task]);


  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("profiles").select("id,name");
      setProfiles(data || []);
    })();
  }, []);

  async function handleSave() {
    if (!title.trim()) {
      alert("Task title is required.");
      return;
    }

    setSaving(true);

    let normalizedProgress = Number(progress) || 0;
    let normalizedStatus = status;

    if (normalizedStatus === "completed") {
      normalizedProgress = 100;
    }

    if (normalizedProgress === 100) {
      normalizedStatus = "completed";
    }

    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse?.user?.id ?? "";
    let userName = "Unknown";

    if (userResponse?.user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", userResponse.user.email)
        .single();

      if (profile?.name) {
        userName = profile.name;
      }
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        title: title.trim(),
        status: normalizedStatus,
        progress: normalizedProgress,
        assigned_to: assignee || null,
      })
      .eq("id", task.id);

    if (taskError) {
      alert(taskError.message);
      setSaving(false);
      return;
    }

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("progress")
      .eq("project_id", projectId);

    if (tasksError) {
      console.error(tasksError);
    }

    const totalProgress = (tasks || []).reduce(
      (sum, currentTask) => sum + Number(currentTask.progress || 0),
      0
    );

    const projectProgress = tasks && tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
    const projectStatus =
      projectProgress === 100
        ? "completed"
        : projectProgress > 0
        ? "active"
        : "todo";

    const { error: projectError } = await supabase
      .from("projects")
      .update({
        progress: projectProgress,
        status: projectStatus,
      })
      .eq("id", projectId);

    if (projectError) {
      console.error(projectError);
    }

    await logActivity({
      userId,
      userName,
      action: `updated task ${title.trim()}`,
      projectId,
      projectName,
    });

    setSaving(false);
    onClose();
    router.refresh();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "var(--bg-surface)",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          padding: "28px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              Edit Task
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
              Update title, status, progress, and assignment.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "24px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ display: "grid", gap: "16px" }}>
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">Todo</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="label">Progress</label>
              <input
                className="input"
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="label">Assignee</label>
            <select
              className="input"
              value={assignee || ""}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
            <button
              className="btn"
              onClick={onClose}
              style={{ flex: 1 }}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !title.trim()}
              style={{ flex: 1, opacity: !title.trim() ? 0.5 : 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
