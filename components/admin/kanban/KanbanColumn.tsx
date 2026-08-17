"use client";

import { useDroppable } from "@dnd-kit/core";
import { KanbanStatus, KANBAN_COLUMNS } from "@/lib/admin/kanban";
import TaskCard from "@/components/admin/kanban/TaskCard";
import type { KanbanTask } from "@/types/admin/kanban";

export default function KanbanColumn({
  status,
  tasks,
  children,
}: {
  status: KanbanStatus;
  tasks: KanbanTask[];
  children?: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const label = KANBAN_COLUMNS.find((c) => c.status === status)?.label ?? status;

  return (
    <section
      className="kanban-column"
      style={{
        minWidth: 280,
        maxWidth: 340,
        flex: "1 1 280px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", fontSize: 14 }}>
          {label}
        </div>
        <span className={`badge ${status === "completed" ? "badge-green" : status === "active" ? "badge-blue" : status === "review" ? "badge-amber" : "badge-amber"}`}>
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        style={{
          borderRadius: 18,
          border: `1px dashed ${isOver ? "var(--accent)" : "var(--border)"}`,
          background: isOver ? "var(--accent-soft)" : "transparent",
          padding: 12,
          minHeight: 180,
          transition: "background 120ms ease, border-color 120ms ease",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {children}
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} />
        ))}
      </div>
    </section>
  );
}

