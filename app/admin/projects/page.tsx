"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { createNotificationForAdmins } from "@/lib/admin/notifications";
import EditProjectModal, { ProjectData } from "@/components/EditProjectModal";
import DeleteProjectButton from "@/app/admin/projects/[id]/DeleteProjectButton";

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

type ClientOption = {
  id: string;
  company_name: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, clients(company_name)")
      .order("created_at", { ascending: false });

    if (!error) setProjects(data || []);
    setFetching(false);
  }, []);

  const loadClients = useCallback(async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, company_name")
      .order("company_name", { ascending: true });

    if (!error && data) {
      setClients(data);
      if (!clientId && data.length > 0) {
        setClientId(data[0].id);
      }
    }
  }, [clientId]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      void loadProjects();
      void loadClients();
    });
    return () => {
      active = false;
    };
  }, [loadProjects, loadClients]);

  async function createProject() {
    if (!name.trim()) return;
    if (!clientId) {
      alert("Please select a client before creating the project.");
      return;
    }
    setLoading(true);

    const { data: projectData, error } = await supabase
      .from("projects")
      .insert([
        {
          name,
          description,
          budget: Number(budget) || 0,
          progress: 0,
          status: "active",
          client_id: clientId || null,
        },
      ])
      .select("id")
      .single();

    if (!error && projectData) {
      const clientOption = clients.find((client) => client.id === clientId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let userName = "Unknown";
      const userId = user?.id ?? "";

      if (user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("email", user.email)
          .single();

        if (profile?.name) {
          userName = profile.name;
        }
      }

      await logActivity({
        userId,
        userName,
        action: `created project ${name} for client ${clientOption?.company_name ?? "Unknown client"}`,
        projectId: projectData.id,
        projectName: name,
        clientId: clientId || undefined,
        clientName: clientOption?.company_name || undefined,
      });

      await createNotificationForAdmins({
        title: "New project created",
        message: `Project ${name} was created for client ${clientOption?.company_name ?? "Unknown client"}.`,
        type: "project",
        relatedId: `/admin/projects/${projectData.id}`,
      });

      setName("");
      setDescription("");
      setBudget("");
      setShowForm(false);
      loadProjects();
    }

    setLoading(false);
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <>
        <style>{`
        .project-row:hover .project-arrow { opacity: 1; transform: translateX(0); }
        .project-arrow { opacity: 0; transform: translateX(-4px); transition: all 0.2s ease; }
        .form-overlay { animation: fadeIn 0.2s ease both; }
        .form-panel { animation: scaleIn 0.25s ease both; }
      `}</style>

      <div style={{ maxWidth: "860px", animation: "fadeUp 0.5s ease both" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: "8px" }}>
              Management
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              Projects
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
              {projects.length} project{projects.length !== 1 ? "s" : ""} total
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            style={{ display: "flex", alignItems: "center", gap: "7px" }}
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
            New Project
          </button>
        </div>

        {/* Create form modal */}
        {showForm && (
          <div
            className="form-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowForm(false);
            }}
          >
            <div
              className="card form-panel"
              style={{ width: "100%", maxWidth: "460px", padding: "28px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "18px",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Create Project
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    fontSize: "20px",
                    padding: "2px 6px",
                    borderRadius: "var(--radius-sm)",
                    transition: "color var(--transition-fast)",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-tertiary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Project Name *
                  </label>
                  <input
                    className="input"
                    placeholder="My awesome project"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createProject()}
                    autoFocus
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-tertiary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Description
                  </label>
                  <input
                    className="input"
                    placeholder="What's this project about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-tertiary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Client
                  </label>
                  <select
                    className="input"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "var(--text-tertiary)",
                      marginBottom: "6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Budget (₹)
                  </label>
                  <input
                    className="input"
                    placeholder="50000"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "8px",
                  }}
                >
                  <button
                    className="btn"
                    onClick={() => setShowForm(false)}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={createProject}
                    disabled={loading || !name.trim()}
                    style={{
                      flex: 2,
                      opacity: !name.trim() ? 0.5 : 1,
                    }}
                  >
                    {loading ? "Creating..." : "Create Project"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Project list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {fetching ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: "80px",
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))
          ) : projects.length === 0 ? (
            <div
              className="card"
              style={{
                padding: "60px 40px",
                textAlign: "center",
                animation: "scaleIn 0.3s ease both",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "14px" }}>📁</div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: "16px",
                  marginBottom: "6px",
                }}
              >
                No projects yet
              </div>
              <p style={{ color: "var(--text-tertiary)", fontSize: "14px" }}>
                Create your first project to get started.
              </p>
            </div>
          ) : (
            projects.map((project, i) => (
              <div
                key={project.id}
                className="card project-row"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  animation: `fadeUp 0.45s ease both`,
                  animationDelay: `${i * 55}ms`,
                  position: "relative",
                }}
              >
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="project-link"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        project.status === "completed"
                          ? "var(--green)"
                          : project.status === "active"
                          ? "var(--accent)"
                          : "var(--amber)",
                      boxShadow:
                        project.status === "active"
                          ? "0 0 0 3px var(--accent-dim)"
                          : "none",
                    }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "14px",
                        letterSpacing: "-0.01em",
                        marginBottom: "3px",
                      }}
                    >
                      {project.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-tertiary)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {project.description || "No description"}
                    </div>
                  </div>

                  <div style={{ width: "120px", flexShrink: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                      }}
                    >
                      <span style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                        Progress
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {project.progress}%
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                      flexShrink: 0,
                      minWidth: "80px",
                      textAlign: "right",
                    }}
                  >
                    ₹{Number(project.budget).toLocaleString("en-IN")}
                  </div>

                  <span
                    className={`badge ${
                      project.status === "completed"
                        ? "badge-green"
                        : project.status === "active"
                        ? "badge-blue"
                        : "badge-amber"
                    }`}
                    style={{ flexShrink: 0 }}
                  >
                    {project.status}
                  </span>
                </Link>

                <div style={{ position: "relative", flexShrink: 0 }}>
                  <button
                    className="btn"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setActiveMenuId((value) => (value === project.id ? null : project.id));
                    }}
                    style={{ padding: "8px 12px", fontSize: "14px" }}
                  >
                    ⋯
                  </button>

                  {activeMenuId === project.id && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "110%",
                        width: "180px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "14px",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.16)",
                        zIndex: 20,
                        padding: "8px",
                      }}
                    >
                      <button
                        className="btn"
                        onClick={() => {
                          setEditingProject(project);
                          setEditOpen(true);
                          setActiveMenuId(null);
                        }}
                        style={{
                          width: "100%",
                          justifyContent: "flex-start",
                          padding: "10px 12px",
                          background: "none",
                          border: "none",
                          color: "var(--text-secondary)",
                        }}
                      >
                        Edit project
                      </button>

                      <div style={{ marginTop: "6px" }}>
                        <DeleteProjectButton projectId={project.id} projectName={project.name} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {editingProject && (
          <EditProjectModal
            open={editOpen}
            project={editingProject}
            onClose={() => {
              setEditOpen(false);
              setEditingProject(null);
            }}
            onSaved={() => {
              loadProjects();
            }}
          />
        )}
      </div>
    </>
    </RoleGuard>
  );
}