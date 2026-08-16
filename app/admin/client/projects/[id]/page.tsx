"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";

import type { Project } from "@/lib/types/admin/client";

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
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading project information…</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card" style={{ padding: "30px", color: "var(--text-tertiary)" }}>
        Project not found or you do not have access to this project.
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="section-label">Project overview</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>{project.name}</h1>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
              Status
            </div>
            <div style={{ fontWeight: 700, fontSize: "18px" }}>{project.status}</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
              Progress
            </div>
            <div style={{ fontWeight: 700, fontSize: "18px" }}>{project.progress}%</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
              Start date
            </div>
            <div>{project.start_date || "TBD"}</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
              Due date
            </div>
            <div>{project.due_date || "TBD"}</div>
          </div>
          <div>
            <div style={{ color: "var(--text-tertiary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px" }}>
              Budget
            </div>
            <div>₹{Number(project.budget || 0).toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ fontSize: "16px", fontWeight: 700, marginBottom: "12px" }}>Project details</div>
        <div style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>{project.description || "No project description has been shared."}</div>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 700 }}>Report</div>
            <div style={{ color: "var(--text-secondary)", marginTop: "6px" }}>
              Download a project summary PDF for your records.
            </div>
          </div>
          <button
            onClick={() => window.print()}
            className="btn btn-primary"
            style={{ padding: "12px 20px" }}
          >
            Download Project Report
          </button>
        </div>
      </div>
    </div>
  );
}
