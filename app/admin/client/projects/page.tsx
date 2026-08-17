"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types/admin/client";
import StatusChip from "@/components/StatusChip";
import { FolderKanban, CalendarDays, ArrowRight, Gauge } from "lucide-react";

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
        .order("updated_at", { ascending: false });

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

      {projects.length === 0 ? (
        <div className="cp-card">
          <div className="cp-empty">
            <div className="cp-empty-icon">
              <FolderKanban size={24} />
            </div>
            No projects are available for your client account yet.
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/client/projects/${project.id}`}
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