"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  budget: number;
  status: string;
  client_id?: string | null;
};

type EditProjectModalProps = {
  open: boolean;
  project: ProjectData;
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditProjectModal({
  open,
  project,
  onClose,
  onSaved,
}: EditProjectModalProps) {
  const router = useRouter();

  const [name, setName] = useState(project.name || "");
  const [description, setDescription] = useState(project.description || "");
  const [budget, setBudget] = useState(String(project.budget || 0));
  const [status, setStatus] = useState(project.status || "active");
  const [clientId, setClientId] = useState(project.client_id || "");
  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  async function loadClients() {
    const { data } = await supabase
      .from("clients")
      .select("id, company_name")
      .order("company_name", { ascending: true });

    if (data) {
      setClients(data);
    }
  }

  useEffect(() => {
    if (!open) return;

    const t = window.setTimeout(() => {
      setName(project.name || "");
      setDescription(project.description || "");
      setBudget(String(project.budget || 0));
      setStatus(project.status || "active");
      setClientId(project.client_id || "");
    }, 0);

    return () => window.clearTimeout(t);
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    // Avoid setState in the effect body; schedule the async work.
    const t = window.setTimeout(() => {
      void loadClients();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);


  async function handleSave() {
    if (!name.trim()) {
      alert("Project name is required.");
      return;
    }

    setSaving(true);

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

    const { error } = await supabase
      .from("projects")
      .update({
        name: name.trim(),
        description: description.trim(),
        budget: Number(budget) || 0,
        status: status as string,
        client_id: clientId || null,
      })
      .eq("id", project.id);

    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }

    await logActivity({
      userId,
      userName,
      action: `updated project ${name.trim()}`,
      projectId: project.id,
      projectName: name.trim(),
    });

    setSaving(false);
    onClose();

    if (onSaved) {
      onSaved();
    }

    router.refresh();
  }

  if (!open) return null;

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
              Edit Project
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
              Update project details and save changes.
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
            <label className="label">Project Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="label">Client</label>
            <select
              className="input"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Unassigned</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label className="label">Budget</label>
              <input
                className="input"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="todo">Todo</option>
              </select>
            </div>
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
              disabled={saving || !name.trim()}
              style={{ flex: 1, opacity: !name.trim() ? 0.5 : 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

