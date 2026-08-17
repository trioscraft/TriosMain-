"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { Field, Input } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";

export default function AddTaskForm({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function recalculateProjectProgress() {
    const { data: tasks, error } = await supabase.from("tasks").select("progress").eq("project_id", projectId);
    if (error || !tasks || tasks.length === 0) return;
    const total = tasks.reduce((sum, task) => sum + Number(task.progress || 0), 0);
    const average = Math.round(total / tasks.length);
    const { error: updateError } = await supabase
      .from("projects")
      .update({ progress: average, status: average === 100 ? "completed" : "active" })
      .eq("id", projectId);
    if (updateError) console.error("Project Update Error:", updateError);
  }

  async function addTask() {
    if (!title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("tasks").insert([{ project_id: projectId, title, progress: 0, status: "todo" }]);
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }
    await recalculateProjectProgress();
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id ?? "";
    let userName = "Unknown";
    if (user?.email) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
      if (profile?.name) userName = profile.name;
    }
    await logActivity({ userId, userName, action: `created task ${title}`, projectId, projectName });
    setTitle("");
    setOpen(false);
    setLoading(false);
    window.location.reload();
  }

  if (!open) {
    return (
      <button className="btn" onClick={() => setOpen(true)} style={{ width: "100%", justifyContent: "center", padding: 14, borderStyle: "dashed", color: "var(--text-tertiary)", fontSize: 14, gap: 8 }}>
        <Plus size={16} /> Add a task
      </button>
    );
  }

  return (
    <div className="card" style={{ padding: 20, animation: "scaleIn 0.2s ease both" }}>
      <Field label="Task title" htmlFor="newtask">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Input
            id="newtask"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addTask();
              if (e.key === "Escape") setOpen(false);
            }}
            autoFocus
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={addTask} loading={loading} disabled={!title.trim()} style={{ flexShrink: 0 }}>
            {!loading && "Add"}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)} style={{ flexShrink: 0, padding: "10px 12px" }} aria-label="Cancel">
            <X size={16} />
          </Button>
        </div>
      </Field>
      <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8 }}>Press Enter to add · Esc to cancel</p>
    </div>
  );
}
