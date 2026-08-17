"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MoreVertical, Pencil, FolderKanban, IndianRupee } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { createNotificationForAdmins } from "@/lib/admin/notifications";
import EditProjectModal, { ProjectData } from "@/components/EditProjectModal";
import DeleteProjectButton from "@/app/admin/projects/[id]/DeleteProjectButton";
import { PageHeader, Card } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/Modal";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";

type Project = {
  id: string;
  name: string;
  description: string;
  budget: number;
  progress: number;
  status: string;
  client_id?: string | null;
  clients?: { company_name?: string | null } | null;
};

function statusTone(status: string): "green" | "blue" | "amber" {
  if (status === "completed") return "green";
  if (status === "active" || status === "in_progress") return "blue";
  return "amber";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [clients, setClients] = useState<{ id: string; company_name: string | null }[]>([]);
  const [clientId, setClientId] = useState("");

  const loadProjects = useCallback(async () => {
    setFetching(true);
    const { data, error } = await supabase.from("projects").select("*, clients(company_name)").order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setFetching(false);
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      void loadProjects();
    });
    return () => {
      active = false;
    };
  }, [loadProjects]);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.from("clients").select("id, company_name").order("company_name");
      if (active) setClients(data || []);
    })();
    return () => {
      active = false;
    };
  }, []);

  async function createProject() {
    if (!name.trim()) return;
    setLoading(true);
    const { data: projectData, error } = await supabase
      .from("projects")
      .insert([{ name, description, budget: Number(budget) || 0, progress: 0, status: "active", client_id: clientId || null }])
      .select("id")
      .single();
    if (error || !projectData) {
      alert(`Failed to create project: ${error?.message ?? "Unknown error"}`);
      setLoading(false);
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? "";
      let userName = "Unknown";
      if (user?.email) {
        const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
        if (profile?.name) userName = profile.name;
      }
      await logActivity({ userId, userName, action: `created project ${name}`, projectId: projectData.id, projectName: name });
      await createNotificationForAdmins({ title: "New project created", message: `Project ${name} was created.`, type: "project", relatedId: `/admin/projects/${projectData.id}` });
    } catch (err) {
      console.error("Post-create steps failed:", err);
    }
    setName("");
    setDescription("");
    setBudget("");
    setClientId("");
    setShowForm(false);
    loadProjects();
    setLoading(false);
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "900px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Projects"
          subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} total`}
          icon={<FolderKanban size={22} />}
          actions={
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <Plus size={16} /> New Project
            </Button>
          }
        />

        {fetching ? (
          <div style={{ display: "grid", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 84, animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={24} />}
            title="No projects yet"
            description="Create your first project to get started."
            action={
              <Button variant="primary" onClick={() => setShowForm(true)}>
                <Plus size={16} /> New Project
              </Button>
            }
          />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {projects.map((project, i) => (
              <Card key={project.id} interactive style={{ padding: "18px 20px", animationDelay: `${i * 50}ms` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <Link href={`/admin/projects/${project.id}`} style={{ flex: 1, display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit", minWidth: 0 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: project.status === "completed" ? "var(--green)" : project.status === "active" ? "var(--accent)" : "var(--amber)",
                        boxShadow: project.status === "active" ? "0 0 0 4px var(--accent-dim)" : "none",
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{project.name}</div>
                      <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {project.description || "No description"}
                        {project.clients?.company_name ? ` · ${project.clients.company_name}` : ""}
                      </div>
                    </div>
                  </Link>

                  <div style={{ width: 130, flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 11, color: "var(--text-tertiary)" }}>
                      <span>Progress</span>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{project.progress}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 600, flexShrink: 0, minWidth: 80, textAlign: "right", display: "inline-flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
                    <IndianRupee size={13} /> {Number(project.budget).toLocaleString("en-IN")}
                  </div>

                  <Badge tone={statusTone(project.status)} dot>
                    {project.status}
                  </Badge>

                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.preventDefault(); setActiveMenuId((v) => (v === project.id ? null : project.id)); }} aria-label="More actions">
                      <MoreVertical size={16} />
                    </Button>
                    {activeMenuId === project.id && (
                      <div
                        className="glass-strong"
                        style={{ position: "absolute", right: 0, top: "110%", width: 190, borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border-hover)", boxShadow: "0 18px 40px rgba(70, 55, 40, 0.25)", zIndex: 20, padding: 8 }}
                      >
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            setEditingProject(project);
                            setEditOpen(true);
                            setActiveMenuId(null);
                          }}
                          style={{ width: "100%", justifyContent: "flex-start", padding: "10px 12px", gap: 8 }}
                        >
                          <Pencil size={14} /> Edit project
                        </button>
                        <div style={{ marginTop: 6 }}>
                          <DeleteProjectButton projectId={project.id} projectName={project.name} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Project" footer={null}>
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Project Name" htmlFor="nproj" required>
              <Input id="nproj" placeholder="My awesome project" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createProject()} autoFocus />
            </Field>
            <Field label="Description" htmlFor="ndesc">
              <Textarea id="ndesc" rows={2} placeholder="What's this project about?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Budget (₹)" htmlFor="nbudget">
                <Input id="nbudget" placeholder="50000" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </Field>
              <Field label="Client" htmlFor="nclient">
                <Select id="nclient" value={clientId} onChange={(e) => setClientId(e.target.value)}>
                  <option value="">— No client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name || "Unnamed client"}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <Button variant="ghost" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={createProject} loading={loading} disabled={!name.trim()} style={{ flex: 2 }}>
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </Modal>

        {editingProject && (
          <EditProjectModal
            open={editOpen}
            project={editingProject}
            onClose={() => {
              setEditOpen(false);
              setEditingProject(null);
            }}
            onSaved={() => loadProjects()}
          />
        )}
      </div>
    </RoleGuard>
  );
}
