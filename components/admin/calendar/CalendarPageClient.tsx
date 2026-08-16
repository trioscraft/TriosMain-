"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarView } from "@/components/admin/calendar/CalendarView";

type Priority = "low" | "medium" | "high" | "urgent";

type TaskEvent = {
  id: string;
  title: string;
  project_id: string;
  project_name?: string | null;
  assigned_to: string | null;
  assigned_name?: string | null;
  priority: Priority;
  due_date: string;
  status: string | null;
  progress: number | null;
};

type Profile = { id: string; name: string };

type Project = { id: string; name: string };

type TaskRow = {
  id: string;
  title: string;
  project_id: string;
  status: string | null;
  progress: number | null;
  assigned_to: string | null;
  priority: Priority | string | null;
  due_date: string | null;
};

type ProjectRow = { id: string; name: string };
type ProfileRow = { id: string; name: string | null };

function startOfDayISO(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarPageClient() {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<Profile[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadFilters() {
      const [{ data: proj, error: projErr }, { data: prof, error: profErr }] = await Promise.all([
        supabase.from("projects").select("id,name").order("name"),
        supabase.from("profiles").select("id,name").order("name"),
      ]);

      if (!mounted) return;
      if (projErr) console.error(projErr);
      if (profErr) console.error(profErr);

      const projectData = (proj || []) as ProjectRow[];
      const profileData = (prof || []) as ProfileRow[];
      setProjects(projectData.map((p) => ({ id: p.id, name: p.name || "Unknown" })));
      setAssignees(profileData.map((p) => ({ id: p.id, name: p.name || "Unknown" })));
    }

    void loadFilters();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoading(true);

      const { data, error } = await supabase
        .from("tasks")
        .select(
          "id,title,project_id,status,progress,assigned_to,priority,due_date"
        )
        .not("due_date", "is", null)
        .order("due_date", { ascending: true });

      if (!mounted) return;
      if (error) {
        console.error(error);
        setEvents([]);
        setLoading(false);
        return;
      }

      const projectIds = Array.from(new Set((data || []).map((t: TaskRow) => t.project_id).filter(Boolean))) as string[];
      const assigneeIds = Array.from(new Set((data || []).map((t: TaskRow) => t.assigned_to).filter(Boolean))) as string[];

      const [projRes, profRes] = await Promise.all([
        projectIds.length
          ? supabase.from("projects").select("id,name").in("id", projectIds)
          : Promise.resolve({ data: [], error: null }),
        assigneeIds.length
          ? supabase.from("profiles").select("id,name").in("id", assigneeIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const projMap = new Map<string, string>();
      const projData = (projRes.data || []) as ProjectRow[];
      projData.forEach((p) => projMap.set(p.id, p.name || "Unknown"));

      const profMap = new Map<string, string>();
      const profData = (profRes.data || []) as ProfileRow[];
      profData.forEach((p) => profMap.set(p.id, p.name || "Unknown"));

      const normalized: TaskEvent[] = (data || []).map((t: TaskRow) => {
        const pr = String(t.priority || "low") as Priority;
        const priority: Priority = ["low", "medium", "high", "urgent"].includes(pr) ? pr : "low";
        return {
          id: t.id,
          title: t.title,
          project_id: t.project_id,
          project_name: projMap.get(t.project_id) || null,
          assigned_to: t.assigned_to,
          assigned_name: t.assigned_to ? profMap.get(t.assigned_to) || null : null,
          priority,
          due_date: t.due_date as string,
          status: t.status || null,
          progress: t.progress ?? null,
        };
      });

      setEvents(normalized);
      setLoading(false);
    }

    void loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  // Realtime updates for tasks (including due_date changes)
  useEffect(() => {
    const channel = supabase
      .channel("calendar-tasks-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          const row = payload.new as TaskRow;
          if (!row?.due_date) return;
          const priority: Priority = ["low", "medium", "high", "urgent"].includes(String(row.priority || "low"))
            ? (row.priority as Priority)
            : "low";

          setEvents((cur) => [
            {
              id: row.id,
              title: row.title,
              project_id: row.project_id,
              project_name: null,
              assigned_to: row.assigned_to,
              assigned_name: null,
              priority,
              due_date: row.due_date as string,
              status: row.status ?? null,
              progress: row.progress ?? null,
            },
            ...cur,
          ]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          const row = payload.new as TaskRow;
          const due = row?.due_date;
          setEvents((cur) => {
            const next = cur
              .map((e) => (e.id === row.id ? { ...e, due_date: due || e.due_date } : e))
              .filter((e) => e.due_date);

            const removed = !due
              ? cur.filter((e) => e.id !== row.id)
              : null;
            if (removed) return removed;

            return next.map((e) => {
              if (e.id !== row.id) return e;
              const priority: Priority = ["low", "medium", "high", "urgent"].includes(String(row.priority || "low"))
                ? (row.priority as Priority)
                : "low";
              return {
                ...e,
                title: row.title,
                project_id: row.project_id,
                assigned_to: row.assigned_to,
                priority,
                status: row.status ?? null,
                progress: row.progress ?? null,
                due_date: due || e.due_date,
              };
            });
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "tasks",
        },
        (payload) => {
          const row = payload.old as TaskRow;
          setEvents((cur) => cur.filter((e) => e.id !== row.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events
      .filter((e) => (projectFilter === "all" ? true : e.project_id === projectFilter))
      .filter((e) => (assigneeFilter === "all" ? true : (e.assigned_to || "") === assigneeFilter))
      .filter((e) => (priorityFilter === "all" ? true : e.priority === priorityFilter))
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          (e.project_name || "").toLowerCase().includes(q) ||
          (e.assigned_name || "").toLowerCase().includes(q)
        );
      });
  }, [events, projectFilter, assigneeFilter, priorityFilter, search]);

  const normalizedAnchorISO = startOfDayISO(anchorDate);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <CalendarView
        view={view}
        onChangeView={setView}
        anchorDate={normalizedAnchorISO}
        onChangeAnchorDate={setAnchorDate}
        events={filteredEvents}
        loading={loading}
        projects={projects}
        assignees={assignees}
        projectFilter={projectFilter}
        assigneeFilter={assigneeFilter}
        priorityFilter={priorityFilter}
        search={search}
        onChangeProjectFilter={setProjectFilter}
        onChangeAssigneeFilter={setAssigneeFilter}
        onChangePriorityFilter={setPriorityFilter}
        onChangeSearch={setSearch}
        onTaskClick={(taskId) => {
          void taskId;
        }}
        onTaskDueDateChange={async (taskId, newISODate) => {
          setEvents((cur) => cur.map((e) => (e.id === taskId ? { ...e, due_date: newISODate } : e)));

          const { error } = await supabase
            .from("tasks")
            .update({ due_date: newISODate })
            .eq("id", taskId);

          if (error) {
            console.error(error);
            const { data } = await supabase
              .from("tasks")
              .select(
                "id,title,project_id,status,progress,assigned_to,priority,due_date"
              )
              .not("due_date", "is", null);

            const rows = (data || []) as TaskRow[];

            setEvents(
              rows.map((t) => {
                const pr = String(t.priority || "low") as Priority;
                const priority: Priority = [
                  "low",
                  "medium",
                  "high",
                  "urgent",
                ].includes(pr)
                  ? pr
                  : "low";

                return {
                  id: t.id,
                  title: t.title,
                  project_id: t.project_id,
                  project_name: null,
                  assigned_to: t.assigned_to,
                  assigned_name: null,
                  priority,
                  due_date: t.due_date as string,
                  status: t.status ?? null,
                  progress: t.progress ?? null,
                };
              })
            );
          }

        }}
      />
    </div>
  );
}