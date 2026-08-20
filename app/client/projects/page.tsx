"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types/admin/client";
import StatusChip from "@/components/StatusChip";
import { FolderKanban, CalendarDays, ArrowRight, Gauge, Search, CheckCircle2, PlayCircle, PauseCircle } from "lucide-react";

const statusFilters = ["all", "active", "completed", "on hold", "paused"] as const;

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;

    async function loadProjects() {
      const currentClient = await getCurrentClientUser();
      if (!mounted || !currentClient) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("id, name, progress, status, start_date, due_date")
        .eq("client_id", currentClient.client_id)
        .order("created_at", { ascending: false });

      if (!error) {
        setProjects(data || []);
      }
      setLoading(false);
    }

    void loadProjects();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="cp-skeleton-list">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="cp-skeleton-card" style={{ animationDelay: `${i * 80}ms` }} />
        ))}
      </div>
    );
  }

  const counts = (status: string) =>
    status === "all"
      ? projects.length
      : projects.filter((p) => (p.status || "").toLowerCase() === status).length;

  const visibleProjects = projects.filter((project) => {
    const matchesSearch =
      !search.trim() ||
      project.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (project.status || "").toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filterIcon = (f: string) => {
    if (f === "active") return <PlayCircle size={14} />;
    if (f === "completed") return <CheckCircle2 size={14} />;
    if (f === "on hold" || f === "paused") return <PauseCircle size={14} />;
    return null;
  };

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div className="cp-header">
        <div>
          <div className="section-label" style={{ marginBottom: 8 }}>
            Projects
          </div>
          <h1>Your active work</h1>
          <p>A private view of the projects assigned to your account.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontSize: 14 }}>
          <Gauge size={16} /> {projects.length} project{projects.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="cp-tabs">
        {statusFilters.map((filter) => (
          <button
            key={filter}
            className={`cp-tab ${statusFilter === filter ? "active" : ""}`}
            onClick={() => setStatusFilter(filter)}
          >
            {filterIcon(filter)}
            <span style={{ textTransform: "capitalize" }}>{filter}</span>
            <span style={{ opacity: 0.75, fontSize: 12 }}>{counts(filter)}</span>
          </button>
        ))}
        <div style={{ marginLeft: "auto", position: "relative", minWidth: 220 }}>
          <Search
            size={15}
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
          />
          <input
            className="input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            style={{ paddingLeft: 36 }}
          />
        </div>
      </div>

      {visibleProjects.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <FolderKanban size={24} />
            </div>
            {search || statusFilter !== "all"
              ? "No projects match your search or filter."
              : "No projects are available for your client account yet."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {visibleProjects.map((project) => (
            <Link
              key={project.id}
              href={`/client/projects/${project.id}`}
              className="cp-project-card"
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div className="cp-project-icon">
                    <FolderKanban size={20} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {project.name}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <StatusChip status={project.status} />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    display: "flex",
                    alignItems: "center",
                    gap: 18,
                    flexShrink: 0,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Progress
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 20,
                        marginTop: 4,
                        color: project.status === "completed" ? "var(--green)" : "var(--accent)",
                      }}
                    >
                      {project.progress}%
                    </div>
                  </div>
                  <ArrowRight size={18} style={{ color: "var(--text-tertiary)" }} />
                </div>
              </div>

              <div className="cp-progress">
                <div
                  className={`cp-progress-fill ${project.status === "completed" ? "done" : ""}`}
                  style={{ width: `${project.progress || 0}%` }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  marginTop: 16,
                  color: "var(--text-secondary)",
                  fontSize: 13,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <CalendarDays size={14} style={{ color: "var(--text-tertiary)" }} />
                  <span>Start {project.start_date || "Not set"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <CalendarDays size={14} style={{ color: "var(--text-tertiary)" }} />
                  <span>Due {project.due_date || "Not set"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}