"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";

type Task = {
  id: string;
  title: string;
  description?: string | null;
  project_id?: string | null;
  projects?: { name?: string | null } | null;
  status?: string;
  priority?: string;
  progress?: number | null;
  due_date?: string | null;
};

const PRIORITY_META: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "badge-red" },
  high: { label: "High", className: "badge-amber" },
  medium: { label: "Medium", className: "badge-blue" },
  low: { label: "Low", className: "badge-green" },
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(t);
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*, projects(name)")
      .eq("assigned_to", user.id)
      .order("due_date", { ascending: true });

    if (!error) setTasks(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => window.clearTimeout(t);
  }, [loadTasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const inProgress = tasks.filter((t) => t.status === "active" || t.status === "in_progress").length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const overdue = tasks.filter((t) => {
      if (t.status === "completed") return false;
      if (!t.due_date) return false;
      return new Date(t.due_date).getTime() < now;
    }).length;
    return { total, inProgress, completed, overdue };
  }, [tasks, now]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.description || "").toLowerCase().includes(q) ||
        (t.projects?.name || "").toLowerCase().includes(q)
      );
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  async function updateProgress(task: Task, progress: number) {
    const next = Math.max(0, Math.min(100, progress));
    setTasks((cur) =>
      cur.map((t) => (t.id === task.id ? { ...t, progress: next, status: next >= 100 ? "completed" : t.status } : t))
    );
    const updates: { progress: number; status?: string } = { progress: next };
    if (next >= 100) updates.status = "completed";

    const { error } = await supabase.from("tasks").update(updates).eq("id", task.id);

    if (error) {
      console.error("Failed to update task progress:", error.message, error);
      void loadTasks();
      return;
    }

    if (next >= 100) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id ?? "";
      await logActivity({
        userId,
        userName: user?.email ?? "Member",
        action: `completed task "${task.title}"`,
        projectId: task.project_id || undefined,
        projectName: task.projects?.name || undefined,
      });
    }
  }

  async function resetStatus(task: Task) {
    setTasks((cur) =>
      cur.map((t) => (t.id === task.id ? { ...t, status: "todo", progress: 0 } : t))
    );
    const { error } = await supabase
      .from("tasks")
      .update({ status: "todo", progress: 0 })
      .eq("id", task.id);
    if (error) {
      console.error("Failed to reopen task:", error.message, error);
      void loadTasks();
    }
  }

  const statCards = [
    { label: "Total tasks", value: stats.total, tone: "var(--accent-bright)" },
    { label: "In progress", value: stats.inProgress, tone: "var(--info)" },
    { label: "Completed", value: stats.completed, tone: "var(--green)" },
    { label: "Overdue", value: stats.overdue, tone: "var(--red)" },
  ];

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: 960, margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
        {/* Header */}
        <div style={{ marginBottom: 26 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Workspace</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            My Tasks
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
            Stay on top of what&apos;s assigned to you across all projects.
          </p>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {statCards.map((s, i) => (
            <div
              key={s.label}
              className="stat-card"
              style={{ animation: `fadeUp 0.45s ease both`, animationDelay: `${i * 60}ms` }}
            >
              <div className="m-metric-label">{s.label}</div>
              <div className="m-metric" style={{ color: s.tone, fontSize: 26 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="card"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
            padding: "16px 18px",
            marginBottom: 18,
          }}
        >
          <input
            className="input"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 150 }}
          >
            <option value="all">All statuses</option>
            <option value="todo">Todo</option>
            <option value="active">Active</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            className="input"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ width: 150 }}
          >
            <option value="all">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Task list */}
        {loading ? (
          <div style={{ display: "grid", gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 110, animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span style={{ fontSize: 22 }}>📋</span>
            </div>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>No tasks found</div>
            <div style={{ fontSize: 13 }}>
              {tasks.length === 0 ? "You have no assigned tasks yet." : "Try adjusting your filters or search."}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filtered.map((task, i) => {
              const priority = PRIORITY_META[task.priority || ""] || PRIORITY_META.medium;
              const pct = Math.max(0, Math.min(100, Number(task.progress || 0)));
              const done = task.status === "completed";
              const overdue =
                !done && task.due_date && new Date(task.due_date).getTime() < now;
              const dueLabel = task.due_date
                ? new Date(task.due_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "No due date";

              return (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    padding: "18px 20px",
                    animation: `fadeUp 0.4s ease both`,
                    animationDelay: `${i * 50}ms`,
                    opacity: done ? 0.72 : 1,
                  }}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {/* Completion toggle */}
                    <button
                      onClick={() => (done ? resetStatus(task) : updateProgress(task, 100))}
                      title={done ? "Reopen task" : "Mark complete"}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        flexShrink: 0,
                        marginTop: 2,
                        border: `2px solid ${done ? "var(--green)" : "var(--glass-border-hover)"}`,
                        background: done ? "var(--green)" : "transparent",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        color: "#f4faf5",
                        fontSize: 12,
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {done ? "✓" : ""}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 600,
                            fontSize: 15,
                            letterSpacing: "-0.01em",
                            textDecoration: done ? "line-through" : "none",
                            color: done ? "var(--text-tertiary)" : "var(--text-primary)",
                          }}
                        >
                          {task.title}
                        </span>
                        <span className={`badge ${priority.className}`}>{priority.label}</span>
                        {done ? (
                          <span className="badge badge-green">Completed</span>
                        ) : overdue ? (
                          <span className="badge badge-red">Overdue</span>
                        ) : (
                          <span className="badge badge-blue">{task.status || "todo"}</span>
                        )}
                      </div>

                      {task.description ? (
                        <p
                          style={{
                            margin: "6px 0 0",
                            fontSize: 13,
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {task.description}
                        </p>
                      ) : null}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          marginTop: 12,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 5,
                            }}
                          >
                            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Progress</span>
                            <span className="num" style={{ fontSize: 11, fontWeight: 600 }}>{pct}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {task.projects?.name && (
                          <Link
                            href={task.project_id ? `/admin/projects/${task.project_id}` : "#"}
                            className="m-chip"
                            style={{ textDecoration: "none" }}
                          >
                            <span style={{ fontSize: 12 }}>📁</span> {task.projects.name}
                          </Link>
                        )}

                        <span
                          className="m-chip"
                          style={{ color: overdue ? "var(--red)" : "var(--text-secondary)" }}
                        >
                          <span style={{ fontSize: 12 }}>📅</span> {dueLabel}
                        </span>

                        {/* Quick progress stepper */}
                        {!done && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              className="btn btn-ghost"
                              onClick={() => updateProgress(task, pct - 25)}
                              style={{ padding: "5px 10px", fontSize: 13 }}
                            >
                              −
                            </button>
                            <button
                              className="btn btn-ghost"
                              onClick={() => updateProgress(task, pct + 25)}
                              style={{ padding: "5px 10px", fontSize: 13 }}
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}