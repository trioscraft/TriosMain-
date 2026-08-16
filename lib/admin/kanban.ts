export type KanbanStatus = "todo" | "active" | "review" | "completed";

export const KANBAN_COLUMNS: Array<{ status: KanbanStatus; label: string }> = [
  { status: "todo", label: "TODO" },
  { status: "active", label: "IN PROGRESS" },
  { status: "review", label: "REVIEW" },
  { status: "completed", label: "DONE" },
];

export function normalizeStatus(input: string | null | undefined): KanbanStatus {
  const value = (input || "todo").toLowerCase();
  if (value === "active" || value === "review" || value === "completed" || value === "todo") {
    return value;
  }
  return "todo";
}

export function statusToProgress(status: KanbanStatus, currentProgress: number | null | undefined) {
  if (status === "completed") return 100;
  if (typeof currentProgress === "number") return currentProgress;
  return 0;
}

export function calcProjectProgress(tasks: Array<{ progress: number | null }>) {
  if (!tasks.length) return { progress: 0, status: "todo" as const };

  const total = tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0);
  const avg = Math.round(total / tasks.length);

  const projectStatus = avg === 100 ? "completed" : avg > 0 ? "active" : "todo";

  return { progress: avg, status: projectStatus as "todo" | "active" | "completed" };
}

