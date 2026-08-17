"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types/admin/client";
import StatusChip from "@/components/StatusChip";
import { ArrowLeft, FolderKanban, CalendarDays, IndianRupee, FileText, Printer } from "lucide-react";

export default function ClientProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

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
        .select("id, name, description, progress, status, start_date, due_date, budget")
        .eq("id", id)
        .eq("client_id", currentClient.client_id)
        .single();

      if (!error) {
        setProject(data);
      }
      setLoading(false);
    }

    void loadProject();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="cp-loading">
        <div className="cp-loading-spinner" />
        Loading project information…
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

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <Link
        href="/admin/client/projects"
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
          <div style={{ marginTop: 10 }}>
            <StatusChip status={project.status} />
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="btn btn-primary"
          style={{ padding: "12px 20px" }}
        >
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

      <div className="cp-card" style={{ marginBottom: 20 }}>
        <div className="cp-meta-grid">
          <div>
            <div className="cp-meta-label">Status</div>
            <div className="cp-meta-value" style={{ fontWeight: 700, fontSize: 17 }}>
              {project.status}
            </div>
          </div>
          <div>
            <div className="cp-meta-label">Budget</div>
            <div className="cp-meta-value big">
              ₹{Number(project.budget || 0).toLocaleString("en-IN")}
            </div>
          </div>
          <div>
            <div className="cp-meta-label">Start date</div>
            <div className="cp-meta-value">{project.start_date || "TBD"}</div>
          </div>
          <div>
            <div className="cp-meta-label">Due date</div>
            <div className="cp-meta-value">{project.due_date || "TBD"}</div>
          </div>
        </div>
      </div>

      <div className="cp-card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          <FolderKanban size={18} style={{ color: "var(--accent)" }} /> Project details
        </div>
        <div style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
          {project.description || "No project description has been shared."}
        </div>
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