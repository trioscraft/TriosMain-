"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

type Project = { id: string; name: string };
type ActiveSession = { id: string; started_at: string; project_id: string };

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function update() {
      const diff = Date.now() - new Date(startedAt).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsed(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "52px",
        fontWeight: 700,
        letterSpacing: "-0.04em",
        color: "var(--accent)",
        fontVariantNumeric: "tabular-nums",
        animation: "fadeIn 0.4s ease both",
      }}
    >
      {elapsed}
    </div>
  );
}

export default function TimerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("You");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ?? "";
      setCurrentUserId(userId);

      if (userId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", userId)
          .single();

        if (profile?.name) {
          setCurrentUserName(profile.name);
        }
      }

      const { data: projectData } = await supabase.from("projects").select("id,name");
      setProjects(projectData || []);

      if (userId) {
        const { data: sessionData } = await supabase
          .from("active_sessions")
          .select("*")
          .eq("user_id", userId)
          .limit(1)
          .single();

        if (sessionData) setActiveSession(sessionData);
      }
    })();
  }, []);

  async function startWork() {
    if (!selectedProject) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("active_sessions")
      .insert([{ user_id: currentUserId || "unknown", project_id: selectedProject }])
      .select()
      .single();

    setLoading(false);
    if (!error) setActiveSession(data);
  }

  async function stopWork() {
    if (!activeSession) return;
    setLoading(true);

    const start = new Date(activeSession.started_at);
    const end = new Date();
    const hours = (end.getTime() - start.getTime()) / 3600000;

    const { error: insertError } = await supabase.from("time_entries").insert([
      {
        user_id: currentUserId || "unknown",
        project_id: activeSession.project_id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        total_hours: Number(hours.toFixed(2)),
      },
    ]);

    if (!insertError) {
      await logActivity({
        userId: currentUserId || "unknown",
        userName: currentUserName,
        action: `logged ${hours.toFixed(2)} hours`,
        projectId: activeSession.project_id,
        projectName: activeProject?.name || "Unknown project",
      });

      await supabase.from("active_sessions").delete().eq("id", activeSession.id);
      setActiveSession(null);
    }

    setLoading(false);
  }

  const activeProject = projects.find((p) => p.id === activeSession?.project_id);

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: "600px", animation: "fadeUp 0.5s ease both" }}>
      {/* Header */}
      <div style={{ marginBottom: "36px" }}>
        <div className="section-label" style={{ marginBottom: "8px" }}>
          Time tracking
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "30px",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          Work Timer
        </h1>
      </div>

      {/* Timer card */}
      <div
        className="card"
        style={{
          padding: "40px",
          textAlign: "center",
          marginBottom: "24px",
          position: "relative",
          overflow: "hidden",
          animation: "scaleIn 0.35s ease both",
        }}
      >
        {/* Ambient glow */}
        {activeSession && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 0%, rgba(99,179,237,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}

        {activeSession ? (
          <>
            {/* Active state */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "var(--green)",
                  animation: "pulse-ring 1.5s infinite",
                }}
              />
              <span
                style={{
                  fontSize: "13px",
                  color: "var(--green)",
                  fontWeight: 500,
                }}
              >
                Recording
              </span>
            </div>

            <ElapsedTimer startedAt={activeSession.started_at} />

            {activeProject && (
              <div
                style={{
                  marginTop: "12px",
                  fontSize: "14px",
                  color: "var(--text-secondary)",
                }}
              >
                Working on{" "}
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {activeProject.name}
                </span>
              </div>
            )}

            <div style={{ marginTop: "8px", fontSize: "12px", color: "var(--text-tertiary)" }}>
              Started {new Date(activeSession.started_at).toLocaleTimeString()}
            </div>

            <button
              className="btn btn-danger"
              onClick={stopWork}
              disabled={loading}
              style={{
                marginTop: "28px",
                padding: "12px 32px",
                fontSize: "15px",
              }}
            >
              {loading ? "Saving..." : "⏹ Stop & Save"}
            </button>
          </>
        ) : (
          <>
            {/* Idle state */}
            <div
              style={{
                fontSize: "72px",
                marginBottom: "8px",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              ⏱
            </div>

            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 600,
                marginBottom: "6px",
                letterSpacing: "-0.02em",
              }}
            >
              Ready to work
            </div>
            <p
              style={{
                color: "var(--text-tertiary)",
                fontSize: "14px",
                marginBottom: "28px",
              }}
            >
              Select a project and start tracking your time.
            </p>

            <select
              className="input"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              style={{ textAlign: "left", marginBottom: "12px", maxWidth: "320px", margin: "0 auto 16px" }}
            >
              <option value="">Select a project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <br />

            <button
              className="btn btn-success"
              onClick={startWork}
              disabled={loading || !selectedProject}
              style={{
                marginTop: "8px",
                padding: "12px 32px",
                fontSize: "15px",
                opacity: !selectedProject ? 0.4 : 1,
              }}
            >
              {loading ? "Starting..." : "▶ Start Work"}
            </button>
          </>
        )}
      </div>

      {/* Tips */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          animation: "fadeUp 0.4s 0.2s ease both",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "16px" }}>💡</span>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "2px" }}>
              Tip
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Your session is saved automatically when you stop. You can view all time
              entries on the dashboard.
            </div>
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}