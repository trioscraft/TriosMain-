"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";

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

type Profile = { id: string; name: string };

export default function EditTaskModal({ open, task, projectId, projectName, onClose }: EditTaskModalProps) {
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
    if (normalizedStatus === "completed") normalizedProgress = 100;
    if (normalizedProgress === 100) normalizedStatus = "completed";

    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse?.user?.id ?? "";
    let userName = "Unknown";
    if (userResponse?.user?.email) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("email", userResponse.user.email).single();
      if (profile?.name) userName = profile.name;
    }

    const { error: taskError } = await supabase
      .from("tasks")
      .update({ title: title.trim(), status: normalizedStatus, progress: normalizedProgress, assigned_to: assignee || null })
      .eq("id", task.id);
    if (taskError) {
      alert(taskError.message);
      setSaving(false);
      return;
    }

    const { data: tasks, error: tasksError } = await supabase.from("tasks").select("progress").eq("project_id", projectId);
    if (tasksError) console.error(tasksError);
    const totalProgress = (tasks || []).reduce((sum, currentTask) => sum + Number(currentTask.progress || 0), 0);
    const projectProgress = tasks && tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
    const projectStatus = projectProgress === 100 ? "completed" : projectProgress > 0 ? "active" : "todo";
    const { error: projectError } = await supabase.from("projects").update({ progress: projectProgress, status: projectStatus }).eq("id", projectId);
    if (projectError) console.error(projectError);

    await logActivity({ userId, userName, action: `updated task ${title.trim()}`, projectId, projectName });
    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Task" size="lg" footer={null}>
      <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: -8, marginBottom: 18 }}>Update title, status, progress, and assignment.</p>
      <div style={{ display: "grid", gap: 16 }}>
        <Field label="Title" htmlFor="ttitle" required>
          <Input id="ttitle" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Status" htmlFor="tstatus">
            <Select id="tstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">Todo</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>
          <Field label="Progress (%)" htmlFor="tprogress">
            <Input id="tprogress" type="number" min={0} max={100} value={progress} onChange={(e) => setProgress(Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Assignee" htmlFor="tassignee">
          <Select id="tassignee" value={assignee || ""} onChange={(e) => setAssignee(e.target.value)}>
            <option value="">Unassigned</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </Select>
        </Field>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={!title.trim()} style={{ flex: 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
