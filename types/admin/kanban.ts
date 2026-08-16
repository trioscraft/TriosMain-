export type KanbanStatus = "todo" | "active" | "review" | "completed";

export type KanbanTask = {
  id: string;
  project_id: string;
  title: string;
  status: KanbanStatus;
  progress: number;
  assigned_to: string | null;
  due_date: string | null;
  assigned_name?: string | null;
};

