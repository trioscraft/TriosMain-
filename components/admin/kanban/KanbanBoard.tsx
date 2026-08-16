"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";

import type { KanbanStatus } from "@/lib/admin/kanban";
import { KANBAN_COLUMNS, normalizeStatus, statusToProgress } from "@/lib/admin/kanban";
import type { KanbanTask } from "@/types/admin/kanban";

import { supabase } from "@/lib/supabase";

import TaskCard from "@/components/admin/kanban/TaskCard";
import KanbanColumn from "@/components/admin/kanban/KanbanColumn";

import DragOverlay from "@/components/admin/kanban/DragOverlay";

export default function KanbanBoard({ projectId }: { projectId?: string }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const [tasks] = useState<KanbanTask[]>([]);


  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const [assigneeOptions, setAssigneeOptions] = useState<Array<{ id: string; name: string }>>([]);

  // Keeping drag state for potential future UX; not currently used.
  const [active, setActive] = useState<{ task: KanbanTask; status: KanbanStatus } | null>(null);




  const applyFilters = useCallback((input: KanbanTask[]) => {
    let out = input;

    if (projectId) {
      out = out.filter((t) => t.project_id === projectId);
    }


    if (assigneeFilter !== "all") {
      out = out.filter((t) => (t.assigned_to || "") === assigneeFilter);
    }

    if (statusFilter !== "all") {
      const normalized = normalizeStatus(statusFilter);
      out = out.filter((t) => t.status === normalized);
    }

    const trimmed = query.trim();
    if (trimmed) {
      const lower = trimmed.toLowerCase();
      out = out.filter((t) => t.title.toLowerCase().includes(lower));
    }

    return out;
  }, [projectId, assigneeFilter, statusFilter, query]);

  const filteredTasks = useMemo(() => applyFilters(tasks), [tasks, applyFilters]);

  const tasksByStatus = useMemo(() => {
    const map: Record<KanbanStatus, KanbanTask[]> = {
      todo: [],
      active: [],
      review: [],
      completed: [],
    };

    for (const t of filteredTasks) map[t.status].push(t);

    // Stable order: keep as-is but ensure deterministic by title if needed.
    for (const s of KANBAN_COLUMNS.map((c) => c.status)) {
      map[s] = map[s]
        .slice()
        .sort((a, b) => {
          const aTs = (a as unknown as { created_at_ts?: number }).created_at_ts ?? 0;
          const bTs = (b as unknown as { created_at_ts?: number }).created_at_ts ?? 0;
          return bTs - aTs;
        });
    }

    return map;
  }, [filteredTasks]);

  // Patch tasks with created_at timestamps so sorting is stable.
  // This avoids needing extra DB columns in the UI; we fetch created_at in load.
  const [tasksWithTs, setTasksWithTs] = useState<Array<KanbanTask & { created_at_ts: number }>>([]);

  // Derive UI tasks directly from tasksWithTs.
   
  async function loadAssigneeOptions() {

    // For performance, pull distinct assigned_to from tasks in scope.
    const res = await supabase
      .from("tasks")
      .select("assigned_to")
      .not("assigned_to", "is", null);

    type TaskAssignedRow = { assigned_to: string | null };
    const ids = Array.from(
      new Set(((res.data as TaskAssignedRow[] | null) || []).map((r) => r.assigned_to).filter(Boolean))
    ) as string[];

    if (!ids.length) {
      setAssigneeOptions([]);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,name")
      .in("id", ids);

    type Profile = { id: string; name: string };
    setAssigneeOptions((profiles || []).map((p) => ({ id: (p as Profile).id, name: (p as Profile).name })));

  }

  async function loadTasks() {
    const { data, error } = await supabase
      .from("tasks")
      .select("id,title,status,progress,assigned_to,due_date,project_id,created_at")
      .order("created_at", { ascending: false });

    if (error) return;

    type TaskRow = {
      id: string;
      project_id: string;
      title: string;
      status: string | null;
      progress: number | null;
      assigned_to: string | null;
      due_date: string | null;
      created_at: string;
    };

    const base = ((data as TaskRow[]) || []).map((t) => {
      const status = normalizeStatus(t.status);

      return {
        id: t.id,
        project_id: t.project_id,
        title: t.title,
        status,
        progress: statusToProgress(status, t.progress),
        assigned_to: t.assigned_to,
        due_date: t.due_date,
        created_at_ts: new Date(t.created_at).getTime(),
        assigned_name: null,
      } satisfies KanbanTask & { created_at_ts: number };
    });

    // Bulk assignee names
    const assigneeIds = Array.from(new Set(base.map((t) => t.assigned_to).filter(Boolean))) as string[];
    const nameMap = new Map<string, string>();

    if (assigneeIds.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,name")
        .in("id", assigneeIds);

      type ProfileRow = { id: string; name: string };
      (profiles || []).forEach((p) => nameMap.set((p as ProfileRow).id, (p as ProfileRow).name));

    }

    setTasksWithTs(
      base.map((t) => ({
        ...t,
        assigned_name: t.assigned_to ? nameMap.get(t.assigned_to) || null : null,
      }))
    );
  }

  useEffect(() => {
    void (async () => {
      await loadTasks();
      await loadAssigneeOptions();
    })();
     
  }, [projectId]);


  // Realtime updates for tasks
  useEffect(() => {
    const channel = supabase
      .channel("kanban-tasks-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          type TaskRealtimeRow = {
            id: string;
            project_id: string;
            title: string;
            status: string | null;
            progress: number | null;
            assigned_to: string | null;
            due_date: string | null;
            created_at: string;
          };
          const row = payload.new as TaskRealtimeRow;

          if (projectId && row.project_id !== projectId) return;
          const status = normalizeStatus(row.status);
          const next: KanbanTask & { created_at_ts: number } = {
            id: row.id,
            project_id: row.project_id,
            title: row.title,
            status,
            progress: statusToProgress(status, row.progress),
            assigned_to: row.assigned_to,
            assigned_name: null,
            due_date: row.due_date,
            created_at_ts: new Date(row.created_at).getTime(),
          };
          setTasksWithTs((cur) => [next, ...cur]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload) => {
          type TaskRealtimeRow = {
            id: string;
            project_id: string;
            title: string;
            status: string | null;
            progress: number | null;
            assigned_to: string | null;
            due_date: string | null;
            created_at?: string;
          };
          const row = payload.new as TaskRealtimeRow;

          if (projectId && row.project_id !== projectId) return;
          const status = normalizeStatus(row.status);
          setTasksWithTs((cur) =>
            cur.map((t) =>
              t.id === row.id
                ? {
                    ...t,
                    status,
                    progress: statusToProgress(status, row.progress),
                    assigned_to: row.assigned_to,
                    due_date: row.due_date,
                  }
                : t
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  async function moveTask(taskId: string, newStatus: KanbanStatus) {
    const task = tasksWithTs.find((t) => t.id === taskId);
    if (!task) return;

    const payload = { taskId, newStatus };

    // Server handles activity + project progress recomputation.
    const res = await fetch("/api/admin/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      // Rollback is handled by realtime updates; still show a minimal error.
      return;
    }
  }

  function handleDragStart(e: DragStartEvent) {
    const id = String(e.active.id);
    const task = tasksWithTs.find((t) => t.id === id);
    if (!task) return;
    setActive({ task: task as KanbanTask, status: task.status });
  }

  async function handleDragEnd(e: DragEndEvent) {
    const { active: activeItem, over } = e;
    setActive(null);

    if (!over) return;

    const activeIdStr = String(activeItem.id);
    const task = tasksWithTs.find((t) => t.id === activeIdStr);
    if (!task) return;

    // Our droppable ids are status values.
    const newStatus = normalizeStatus(String(over.id));
    if (task.status === newStatus) return;

    // Optimistic update
    setTasksWithTs((cur) =>
      cur.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: newStatus,
              progress: statusToProgress(newStatus, t.progress),
            }
          : t
      )
    );

    await moveTask(task.id, newStatus);
  }

  return (
    <div>
      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ flex: "1 1 220px" }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            placeholder="Search by title..."
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ flex: "1 1 220px" }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>Assignee</label>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="input" style={{ width: "100%" }}>
            <option value="all">All</option>
            {assigneeOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: "1 1 200px" }}>
          <label style={{ display: "block", fontSize: 12, color: "var(--text-tertiary)", marginBottom: 6 }}>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input" style={{ width: "100%" }}>
            <option value="all">All</option>
            <option value="todo">Todo</option>
            <option value="active">Active</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
      >
        <SortableContext items={tasksWithTs.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(280px, 1fr))",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 8,
            }}
          >
            {KANBAN_COLUMNS.map((col) => (
              <StatusDroppableColumn key={col.status} status={col.status} tasks={tasksByStatus[col.status]} active={active} />
            ))}
          </div>
        </SortableContext>

        {/* Overlay */}
        <DragOverlay />
      </DndContext>
    </div>
  );
}

function StatusDroppableColumn({
  status,
  tasks,
}: {
  status: KanbanStatus;
  tasks: KanbanTask[];
  active: { task: KanbanTask; status: KanbanStatus } | null;
}) {
  // We use dnd-kit sortable per card, and the droppable container id is the status.
  // Each TaskCard is already wrapped by SortableTask wrapper in column.

  return (
    <KanbanColumn status={status} tasks={tasks}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }} id={status}>
        {tasks.map((t) => (
          <SortableTaskItem key={t.id} task={t} />
        ))}
      </div>
    </KanbanColumn>
  );
}

function SortableTaskItem({ task }: { task: KanbanTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

