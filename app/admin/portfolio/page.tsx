"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FolderOpen, Pencil, Trash2, Star, Eye, EyeOff, ExternalLink } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import PortfolioForm, { PortfolioProjectData, PortfolioFormValues } from "@/components/PortfolioForm";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { PageHeader } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Modal } from "@/components/admin/ui/Modal";

export default function AdminPortfolioPage() {
  const [projects, setProjects] = useState<PortfolioProjectData[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<PortfolioProjectData | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadProjects();
  }, []);

  async function loadProjects() {
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  }

  async function currentUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    let userId = user?.id ?? "";
    let userName = "Unknown";
    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", user.email)
        .single();
      if (profile?.name) userName = profile.name;
    }
    return { userId, userName };
  }

  async function handleCreate(values: PortfolioFormValues) {
    if (!values.title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("portfolio_projects").insert([values]);
    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }
    const { userId, userName } = await currentUser();
    await logActivity({ userId, userName, action: `created portfolio project ${values.title}` });
    setShowCreate(false);
    await loadProjects();
    setSaving(false);
  }

  async function handleUpdate(values: PortfolioFormValues) {
    if (!editProject) return;
    if (!values.title.trim()) {
      alert("Title is required.");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("portfolio_projects")
      .update(values)
      .eq("id", editProject.id);
    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }
    const { userId, userName } = await currentUser();
    await logActivity({ userId, userName, action: `updated portfolio project ${values.title}` });
    setEditProject(null);
    await loadProjects();
    setSaving(false);
  }

  async function handleTogglePublished(project: PortfolioProjectData) {
    await supabase
      .from("portfolio_projects")
      .update({ published: !project.published })
      .eq("id", project.id);
    await loadProjects();
  }

  async function handleDelete() {
    if (!deleteProjectId) return;
    setDeleting(true);
    const { error } = await supabase.from("portfolio_projects").delete().eq("id", deleteProjectId);
    if (error) {
      alert(error.message);
      setDeleting(false);
      return;
    }
    const removed = projects.find((p) => p.id === deleteProjectId);
    if (removed) {
      const { userId, userName } = await currentUser();
      await logActivity({ userId, userName, action: `deleted portfolio project ${removed.title}` });
    }
    setProjects((current) => current.filter((p) => p.id !== deleteProjectId));
    setDeleteProjectId(null);
    setDeleting(false);
  }

  const filtered = projects.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q) ||
      (p.tagline || "").toLowerCase().includes(q)
    );
  });

  const publishedCount = projects.filter((p) => p.published).length;

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "1000px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Portfolio Projects"
          subtitle={`${projects.length} total · ${publishedCount} published on the website.`}
          icon={<FolderOpen size={22} />}
          actions={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> New Project
            </Button>
          }
        />

        <div style={{ position: "relative", marginBottom: 24, maxWidth: 460 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input className="input" placeholder="Search projects" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: 14 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: 120, animationDelay: `${index * 80}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen size={24} />}
            title={search ? "No matching projects" : "No portfolio projects yet"}
            description={search ? "Adjust your search." : "Add a project and publish it to showcase it on the website."}
            action={
              !search && (
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                  <Plus size={16} /> New Project
                </Button>
              )
            }
          />
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((project) => (
              <div key={project.id} className="card" style={{ padding: 16, display: "flex", gap: 16, alignItems: "center" }}>
                {project.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{ width: 96, height: 64, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid var(--border)" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                  />
                ) : (
                  <div style={{ width: 96, height: 64, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--glass-bg)", border: "1px solid var(--border)", color: "var(--text-tertiary)" }}>
                    <FolderOpen size={22} />
                  </div>
                )}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>{project.title}</span>
                    {project.featured && (
                      <Badge tone="brass" dot>
                        <Star size={11} style={{ display: "inline" }} /> Featured
                      </Badge>
                    )}
                    <Badge tone={project.published ? "green" : "amber"} dot>
                      {project.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {project.category && (
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>
                      {project.category}
                      {project.tech?.length > 0 && (
                        <span style={{ color: "var(--text-tertiary)" }}> · {project.tech.join(", ")}</span>
                      )}
                    </div>
                  )}
                  {(project.demo_url || project.video_url) && (
                    <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 6 }}>
                      {project.demo_url && (
                        <a href={project.demo_url} target="_blank" rel="noreferrer" style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                          <ExternalLink size={12} /> Demo
                        </a>
                      )}
                      {project.video_url && (
                        <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                          <ExternalLink size={12} /> Video
                        </span>
                      )}
                    </div>
                  )}
                  {(project.gallery?.length > 0 || project.videos?.length > 0) && (
                    <div style={{ display: "flex", gap: 14, fontSize: 12.5, color: "var(--text-tertiary)", marginTop: 4 }}>
                      {project.gallery?.length > 0 && <span>🖼 {project.gallery.length} image{project.gallery.length > 1 ? "s" : ""}</span>}
                      {project.videos?.length > 0 && <span>🎬 {project.videos.length} video{project.videos.length > 1 ? "s" : ""}</span>}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
                  <Button variant="ghost" size="sm" onClick={() => void handleTogglePublished(project)} leftIcon={project.published ? <EyeOff size={14} /> : <Eye size={14} />}>
                    {project.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditProject(project)} leftIcon={<Pencil size={14} />}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteProjectId(project.id)} leftIcon={<Trash2 size={14} />}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Portfolio Project" size="lg" footer={null}>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: -8, marginBottom: 18 }}>
            Add a project to showcase on the website. Toggle &quot;Published&quot; when it&apos;s ready.
          </p>
          <PortfolioForm
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
            submitting={saving}
            submitLabel={saving ? "Saving..." : "Add Project"}
          />
        </Modal>

        {editProject && (
          <Modal open={Boolean(editProject)} onClose={() => setEditProject(null)} title="Edit Portfolio Project" size="lg" footer={null}>
            <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: -8, marginBottom: 18 }}>
              Update the project details below.
            </p>
            <PortfolioForm
              initialData={editProject}
              onSubmit={handleUpdate}
              onCancel={() => setEditProject(null)}
              submitting={saving}
              submitLabel={saving ? "Saving..." : "Update Project"}
            />
          </Modal>
        )}

        <ConfirmDeleteModal
          open={Boolean(deleteProjectId)}
          title="Delete portfolio project"
          description="This will permanently remove the project from the website. This action cannot be undone."
          confirmLabel="Delete project"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProjectId(null)}
        />
      </div>
    </RoleGuard>
  );
}