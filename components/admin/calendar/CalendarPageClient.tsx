"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarView } from "@/components/admin/calendar/CalendarView";
import { getIndianHolidaysInRange } from "@/lib/indian-calendar";

export type Priority = "low" | "medium" | "high" | "urgent";

export type CalendarEvent = {
  id: string;
  kind: "task" | "project" | "holiday";
  title: string;
  project_id: string;
  project_name?: string | null;
  assigned_to: string | null;
  assigned_name?: string | null;
  priority: Priority;
  due_date: string;
  status: string | null;
  progress: number | null;
  client_name?: string | null;
  budget?: number | null;
  holiday_type?: "festival" | "national";
  emoji?: string;
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

type ProjectRow = {
  id: string;
  name: string;
  client_id: string | null;
  status: string | null;
  progress: number | null;
  due_date: string | null;
  budget: number | null;
};
type ProfileRow = { id: string; name: string | null };
type ClientRow = { id: string; company_name: string | null };

function startOfDayISO(d: Date) {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function normalizePriority(value: Priority | string | null): Priority {
  const pr = String(value || "low") as Priority;
  return ["low", "medium", "high", "urgent"].includes(pr) ? pr : "low";
}

export default function CalendarPageClient() {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [assignees, setAssignees] = useState<Profile[]>([]);

  const clientNameMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    let mounted = true;

    async function loadFilters() {
      const [{ data: proj, error: projErr }, { data: prof, error: profErr }, { data: clients, error: clientErr }] =
        await Promise.all([
          supabase.from("projects").select("id,name").order("name"),
          supabase.from("profiles").select("id,name").order("name"),
          supabase.from("clients").select("id,company_name"),
        ]);

      if (!mounted) return;
      if (projErr) console.error(projErr);
      if (profErr) console.error(profErr);
      if (clientErr) console.error(clientErr);

      const projectData = (proj || []) as ProjectRow[];
      const profileData = (prof || []) as ProfileRow[];
      setProjects(projectData.map((p) => ({ id: p.id, name: p.name || "Unknown" })));
      setAssignees(profileData.map((p) => ({ id: p.id, name: p.name || "Unknown" })));

      const clientMap = new Map<string, string>();
      ((clients || []) as ClientRow[]).forEach((c) => {
        if (c.id) clientMap.set(c.id, c.company_name || "Client");
      });
      clientNameMap.current = clientMap;
    }

    void loadFilters();
    return () => {
      mounted = false;
    };
  }, []);

  function buildProjectEvents(rows: ProjectRow[]): CalendarEvent[] {
    const map = clientNameMap.current;
    return (rows || [])
      .filter((p) => p.due_date)
      .map((p) => ({
        id: `proj_${p.id}`,
        kind: "project" as const,
        title: p.name,
        project_id: p.id,
        project_name: p.name,
        assigned_to: null,
        assigned_name: null,
        priority: "low" as Priority,
        due_date: p.due_date as string,
        status: p.status ?? null,
        progress: p.progress ?? null,
        client_name: p.client_id ? map.get(p.client_id) || null : null,
        budget: p.budget ?? null,
      }));
  }

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoading(true);

      const [taskRes, projRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id,title,project_id,status,progress,assigned_to,priority,due_date")
          .not("due_date", "is", null)
          .order("due_date", { ascending: true }),
        supabase
          .from("projects")
          .select("id,name,client_id,status,progress,due_date,budget")
          .not("due_date", "is", null)
          .order("due_date", { ascending: true }),
      ]);

      if (!mounted) return;

      if (taskRes.error) {
        console.error("tasks load failed:", taskRes.error?.message, "code:", taskRes.error?.code, taskRes.error);
      }
      if (projRes.error) {
        console.error("projects load failed:", projRes.error?.message, projRes.error);
      }

      const tasks = taskRes.data || [];
      const projectRows = projRes.data || [];

      const projectIds = Array.from(new Set((tasks as TaskRow[]).map((t) => t.project_id).filter(Boolean))) as string[];
      const assigneeIds = Array.from(new Set((tasks as TaskRow[]).map((t) => t.assigned_to).filter(Boolean))) as string[];

      const [namesRes, profRes] = await Promise.all([
        projectIds.length
          ? supabase.from("projects").select("id,name").in("id", projectIds)
          : Promise.resolve({ data: [], error: null }),
        assigneeIds.length
          ? supabase.from("profiles").select("id,name").in("id", assigneeIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      const projMap = new Map<string, string>();
      ((namesRes.data || []) as ProjectRow[]).forEach((p) => projMap.set(p.id, p.name || "Unknown"));

      const profMap = new Map<string, string>();
      ((profRes.data || []) as ProfileRow[]).forEach((p) => profMap.set(p.id, p.name || "Unknown"));

      const taskEvents: CalendarEvent[] = (tasks as TaskRow[]).map((t) => ({
        id: t.id,
        kind: "task" as const,
        title: t.title,
        project_id: t.project_id,
        project_name: projMap.get(t.project_id) || null,
        assigned_to: t.assigned_to,
        assigned_name: t.assigned_to ? profMap.get(t.assigned_to) || null : null,
        priority: normalizePriority(t.priority),
        due_date: t.due_date as string,
        status: t.status || null,
        progress: t.progress ?? null,
      }));

      const projectEvents = buildProjectEvents(projectRows as ProjectRow[]);

      setEvents([...taskEvents, ...projectEvents].sort((a, b) => a.due_date.localeCompare(b.due_date)));
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

          setEvents((cur) => [
            {
              id: row.id,
              kind: "task",
              title: row.title,
              project_id: row.project_id,
              project_name: null,
              assigned_to: row.assigned_to,
              assigned_name: null,
              priority: normalizePriority(row.priority),
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

            const removed = !due ? cur.filter((e) => e.id !== row.id) : null;
            if (removed) return removed;

            return next.map((e) => {
              if (e.id !== row.id) return e;
              return {
                ...e,
                title: row.title,
                project_id: row.project_id,
                assigned_to: row.assigned_to,
                priority: normalizePriority(row.priority),
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

  // Realtime for project due dates (set by clients)
  useEffect(() => {
    const channel = supabase
      .channel("calendar-projects-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "projects",
        },
        () => refreshProjectEvents()
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "projects",
        },
        () => refreshProjectEvents()
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "projects",
        },
        () => refreshProjectEvents()
      )
      .subscribe();

    async function refreshProjectEvents() {
      const { data } = await supabase
        .from("projects")
        .select("id,name,client_id,status,progress,due_date,budget")
        .not("due_date", "is", null);

      if (data == null) return;
      const projectEvents = buildProjectEvents((data as ProjectRow[]));

      setEvents((cur) => {
        const tasks = cur.filter((e) => e.kind === "task");
        return [...tasks, ...projectEvents].sort((a, b) => a.due_date.localeCompare(b.due_date));
      });
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Indian festivals & national holidays — recompute around the visible window
  // so the month grid, navigation, and the "Upcoming" list all stay populated.
  const holidayEvents = useMemo<CalendarEvent[]>(() => {
    const from = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1);
    const to = new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 13, 0);
    return getIndianHolidaysInRange(startOfDayISO(from), startOfDayISO(to)).map((h) => ({
      id: `hol_${h.date}_${h.name.replace(/\s+/g, "_")}`,
      kind: "holiday" as const,
      title: h.name,
      project_id: "",
      project_name: null,
      assigned_to: null,
      assigned_name: null,
      priority: "low" as Priority,
      due_date: h.date,
      status: null,
      progress: null,
      holiday_type: h.holiday_type,
      emoji: h.emoji,
    }));
  }, [anchorDate]);

  const mergedEvents = useMemo(
    () => [...events, ...holidayEvents].sort((a, b) => a.due_date.localeCompare(b.due_date)),
    [events, holidayEvents]
  );

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mergedEvents
      .filter((e) => {
        if (e.kind === "holiday") return true;
        if (projectFilter !== "all" && e.project_id !== projectFilter) return false;
        if (assigneeFilter !== "all" && (e.assigned_to || "") !== assigneeFilter) return false;
        if (priorityFilter !== "all" && e.priority !== priorityFilter) return false;
        return true;
      })
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          (e.project_name || "").toLowerCase().includes(q) ||
          (e.assigned_name || "").toLowerCase().includes(q) ||
          (e.client_name || "").toLowerCase().includes(q)
        );
      });
  }, [mergedEvents, projectFilter, assigneeFilter, priorityFilter, search]);

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
                const priority = normalizePriority(t.priority);
                return {
                  id: t.id,
                  kind: "task",
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
