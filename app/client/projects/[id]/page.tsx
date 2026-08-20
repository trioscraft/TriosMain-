"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types/admin/client";
import StatusChip from "@/components/StatusChip";
import DatePicker from "@/components/DatePicker";
import {
  ArrowLeft,
  FolderKanban,
  FileText,
  Printer,
  Pencil,
  Save,
  X,
  Lock,
  CheckCircle2,
} from "lucide-react";

const editButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "9px 16px",
  borderRadius: "var(--radius-md)",
  fontSize: 13,
  fontWeight: 600,
  color: "var(--accent)",
  background: "var(--accent-soft)",
  border: "1px solid var(--border-accent)",
  cursor: "pointer",
  transition: "background var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast)",
};

function formatINR(amount: number) {
  return `\u20B9${Number(amount || 0).toLocaleString("en-IN")}`;
}

export default function ClientProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Editable draft fields
  const [editing, setEditing] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient || !id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, description, progress, status, start_date, due_date, budget, created_at")
        .eq("id", id)
        .eq("client_id", currentClient.client_id)
        .single();

      if (!error && data) {
        setProject(data);
        seedDraft(data);
      }
      setLoading(false);
    }

    void loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  function seedDraft(p: Project) {
    setDueDate(p.due_date || "");
    setBudget(p.budget != null ? String(p.budget) : "");
    setDescription(p.description || "");
  }

  function startEditing() {
    if (project) seedDraft(project);
    setEditing(true);
    setSaved(false);
    setSaveError("");
  }

  function cancelEditing() {
    if (project) seedDraft(project);
    setEditing(false);
    setSaveError("");
  }

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    setSaveError("");

    // Start date is locked to the project's created date (auto-populated if missing)
    const updates: {
      due_date: string | null;
      budget: number | null;
      description: string;
      start_date?: string;
    } = {
      due_date: dueDate.trim() || null,
      budget: budget.trim() === "" ? null : Number(budget.trim()),
      description: description.trim(),
    };

    if (!project.start_date && project.created_at) {
      updates.start_date = project.created_at.split("T")[0];
    }

    if (typeof updates.budget === "number" && (isNaN(updates.budget) || updates.budget < 0)) {
      setSaveError("Budget must be a valid non-negative amount.");
      setSaving(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) {
      setSaveError("Your session has expired. Please log in again.");
      setSaving(false);
      return;
    }

    let res: Response;
    try {
      res = await fetch(`/api/client/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch {
      setSaveError("Network error while saving. Please try again.");
      setSaving(false);
      return;
    }

    setSaving(false);

    const payload = (await res.json().catch(() => null)) as
      | { project?: Project; error?: string }
      | null;

    if (!res.ok || !payload?.project) {
      setSaveError(payload?.error || "Failed to save changes. Please try again.");
      return;
    }

    setProject(payload.project);
    setEditing(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 4000);
  }

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-loading-spinner" />
        Loading project information...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="cp-card" style={{ padding: 30 }}>
        <div className="cp-empty">
          <div className="cp-empty-icon">
            <FolderKanban size={24} />
          </div>
          Project not found or you do not have access to this project.
        </div>
      </div>
    );
  }

  const done = project.status === "completed";
  const startDate = project.start_date || (project.created_at ? project.created_at.split("T")[0] : null);

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <Link
        href="/client/projects"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13.5,
          fontWeight: 600,
          color: "var(--text-secondary)",
          textDecoration: "none",
          marginBottom: 18,
        }}
      >
        <ArrowLeft size={15} /> Back to projects
      </Link>

      <div className="cp-header" style={{ marginBottom: 22 }}>
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Project overview
          </div>
          <h1>{project.name}</h1>
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
            <StatusChip status={project.status} />
            {!editing && !saved && (
              <button
                onClick={startEditing}
                style={editButtonStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--accent)";
                  e.currentTarget.style.color = "#fff7ee";
                  e.currentTarget.style.boxShadow = "0 8px 20px -8px var(--accent-glow)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--accent-soft)";
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Pencil size={14} /> Edit details
              </button>
            )}
            {saved && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--green)",
                }}
              >
                <CheckCircle2 size={15} /> Changes saved
              </span>
            )}
          </div>
        </div>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ padding: "12px 20px" }}>
          <Printer size={15} /> Download Project Report
        </button>
      </div>

      {/* Progress banner */}
      <div className="cp-hero" style={{ marginBottom: 20 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
            <div className="cp-hero-eyebrow">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: done ? "var(--green)" : "var(--accent)",
                  boxShadow: done ? "0 0 8px var(--green-glow)" : "0 0 8px var(--accent-glow)",
                }}
              />
              {done ? "Completed" : "Overall progress"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 42,
                fontWeight: 700,
                lineHeight: 1,
                color: done ? "var(--green)" : "var(--accent)",
              }}
            >
              {project.progress}%
            </div>
          </div>
          <div className="cp-progress" style={{ marginTop: 18, height: 10 }}>
            <div
              className={`cp-progress-fill ${done ? "done" : ""}`}
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <p style={{ color: "var(--text-secondary)", marginTop: 14, fontSize: 13.5 }}>
            {done
              ? "This project has been delivered. You can download the final report above."
              : "Progress updates are refreshed as milestones are completed."}
          </p>
        </div>
      </div>

      {/* Project information card */}
      <div className="cp-card" style={{ marginBottom: 20 }}>
        {editing ? (
          <div style={{ display: "grid", gap: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 16,
                fontWeight: 700,
                paddingBottom: 14,
                borderBottom: "1px solid var(--glass-border)",
              }}
            >
              <Pencil size={17} style={{ color: "var(--accent)" }} /> Edit project details
            </div>

            <div className="cp-meta-grid">
              {/* Start date - locked */}
              <div>
                <label className="label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  Start date <Lock size={12} style={{ color: "var(--text-tertiary)" }} />
                </label>
                <input className="input" value={startDate || ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6 }}>
                  Set automatically when the project was created and cannot be changed.
                </div>
              </div>

              {/* Due date - editable */}
              <div>
                <label className="label">Due date</label>
                <DatePicker value={dueDate} onChange={setDueDate} min={startDate || undefined} />
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 6 }}>
                  You can adjust your expected completion date.
                </div>
              </div>

              {/* Budget - editable */}
              <div>
                <label className="label">Budget (INR)</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <div className="cp-meta-label">Status</div>
                <div className="cp-meta-value" style={{ fontWeight: 700, fontSize: 17 }}>
                  {project.status}
                </div>
              </div>
            </div>

            <div>
              <label className="label">Project details</label>
              <textarea
                className="input"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any notes, scope, or requirements for your project..."
                style={{ minHeight: 120 }}
              />
            </div>

            {saveError && (
              <div style={{ fontSize: 13, color: "var(--red)", display: "flex", alignItems: "center", gap: 6 }}>
                {saveError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button onClick={cancelEditing} className="btn" disabled={saving} style={{ padding: "12px 20px" }}>
                <X size={15} /> Cancel
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={saving} style={{ padding: "12px 20px" }}>
                <Save size={15} /> {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="cp-meta-grid" style={{ marginBottom: 22 }}>
              <div>
                <div className="cp-meta-label">Status</div>
                <div className="cp-meta-value" style={{ fontWeight: 700, fontSize: 17 }}>
                  {project.status}
                </div>
              </div>
              <div>
                <div className="cp-meta-label">Budget</div>
                <div className="cp-meta-value big">{formatINR(project.budget || 0)}</div>
              </div>
              <div>
                <div className="cp-meta-label">Start date</div>
                <div className="cp-meta-value">{startDate || "TBD"}</div>
              </div>
              <div>
                <div className="cp-meta-label">Due date</div>
                <div className="cp-meta-value">{project.due_date || "TBD"}</div>
              </div>
            </div>

            <div style={{ paddingTop: 18, borderTop: "1px solid var(--glass-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                <FolderKanban size={18} style={{ color: "var(--accent)" }} /> Project details
              </div>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
                {project.description || "No project description has been shared yet."}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="cp-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="cp-report-icon" style={{ marginBottom: 0 }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Project report</div>
              <div style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 13.5 }}>
                Download a project summary PDF for your records.
              </div>
            </div>
          </div>
          <button onClick={() => window.print()} className="btn" style={{ padding: "12px 20px" }}>
            <Printer size={15} /> Download report
          </button>
        </div>
      </div>
    </div>
  );
}