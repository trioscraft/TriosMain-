"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentClientUser } from "@/lib/admin/client-auth";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/types/admin/client";


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
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-slate-900 p-8 rounded-xl">Loading projects…</div>
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.5s ease both" }}>
      <div style={{ marginBottom: "20px" }}>
        <div className="section-label">Projects</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "30px", fontWeight: 700 }}>
          Your active work
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
          A private view of the projects assigned to your account.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ padding: "32px", color: "var(--text-tertiary)" }}>
          No projects are available for your client account yet.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/client/projects/${project.id}`}
              className="card card-interactive"
              style={{ padding: "20px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700 }}>{project.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "6px" }}>
                    Status: {project.status}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>Progress</div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "18px" }}>{project.progress}%</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginTop: "18px", color: "var(--text-secondary)", fontSize: "13px" }}>
                <div>
                  <div>Start date</div>
                  <div style={{ marginTop: "4px" }}>{project.start_date || "Not set"}</div>
                </div>
                <div>
                  <div>Due date</div>
                  <div style={{ marginTop: "4px" }}>{project.due_date || "Not set"}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
