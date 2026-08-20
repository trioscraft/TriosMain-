import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logActivity } from "@/lib/activity";
import { createNotificationForAdmins } from "@/lib/admin/notifications";

import type { KanbanStatus } from "@/lib/admin/kanban";
import { normalizeStatus } from "@/lib/admin/kanban";

function mapStatusToActivity(status: KanbanStatus, taskTitle: string) {
  if (status === "review") return `task moved to review`;
  if (status === "completed") return `completed task ${taskTitle}`;
  if (status === "active") return `task moved to active`;
  return `task moved to todo`;
}

function computeProjectProgress(tasks: Array<{ progress: number | null }>) {
  if (!tasks.length) return { progress: 0, status: "todo" as const };
  const total = tasks.reduce((sum, t) => sum + Number(t.progress || 0), 0);
  const avg = Math.round(total / tasks.length);
  const projectStatus = avg === 100 ? "completed" : avg > 0 ? "active" : "todo";
  return { progress: avg, status: projectStatus };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const assignee = url.searchParams.get("assignee");
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");

  // In this project most pages are server components with RoleGuard.
  // We keep API open but rely on Supabase RLS.
  const select = "id,title,status,progress,assigned_to,due_date,project_id";
  let query = supabase.from("tasks").select(select).order("created_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);
  if (assignee) query = query.eq("assigned_to", assignee);
  if (status) query = query.eq("status", status);
  if (q) query = query.ilike("title", `%${q}%`);


  const { data: tasks, error } = await query;
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });

  // Bulk fetch assignee names
  const assigneeIds = Array.from(new Set((tasks || []).map((t: { assigned_to: string | null }) => t.assigned_to).filter(Boolean)));
  const nameMap = new Map<string, string>();
  if (assigneeIds.length) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,name")
      .in("id", assigneeIds);

    (profiles || []).forEach((p: { id: string; name: string | null }) => nameMap.set(p.id, p.name || "Unknown"));
  }

  type TaskRow = {
    id: string;
    project_id: string;
    title: string;
    status: string;
    progress: number | null;
    assigned_to: string | null;
    due_date: string | null;
  };

  const enriched = (tasks || []).map((t: TaskRow) => ({
    id: t.id,
    project_id: t.project_id,
    title: t.title,
    status: normalizeStatus(t.status),
    progress: Number(t.progress || 0),
    assigned_to: t.assigned_to,
    assigned_name: t.assigned_to ? nameMap.get(t.assigned_to) || null : null,
    due_date: t.due_date || null,
  }));

  return NextResponse.json({ tasks: enriched }, { status: 200 });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { taskId, newStatus } = body as { taskId: string; newStatus: KanbanStatus };

  // Server-only route — use the service-role client so moves persist
  // regardless of RLS, and so admin notifications can be written.
  const { data: task, error: taskError } = await supabaseAdmin
    .from("tasks")
    .select("id,title,status,progress,project_id,assigned_to")
    .eq("id", taskId)
    .single();

  if (taskError || !task) {
    return NextResponse.json({ message: taskError?.message ?? "Task not found" }, { status: 404 });
  }

  const status = normalizeStatus(newStatus);
  const nextProgress = status === "completed" ? 100 : Number(task.progress || 0);

  const { error: updateError } = await supabaseAdmin
    .from("tasks")
    .update({ status, progress: nextProgress })
    .eq("id", taskId);

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  // recompute project progress
  const { data: projectTasks, error: tasksError } = await supabaseAdmin
    .from("tasks")
    .select("progress")
    .eq("project_id", task.project_id);

  if (tasksError) {
    return NextResponse.json({ message: tasksError.message }, { status: 500 });
  }

  const { progress, status: projectStatus } = computeProjectProgress(projectTasks || []);

  const { error: projectError } = await supabaseAdmin
    .from("projects")
    .update({ progress, status: projectStatus })
    .eq("id", task.project_id);

  if (projectError) {
    return NextResponse.json({ message: projectError.message }, { status: 500 });
  }

  // activity + notification
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? "";
  let userName = "Unknown";
  if (user?.email) {
    const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
    if (profile?.name) userName = profile.name;
  }

  await logActivity({
    userId,
    userName,
    action: mapStatusToActivity(status, task.title || "Untitled task"),
    projectId: task.project_id,
    projectName: undefined,
    quotationId: undefined,
    invoiceId: undefined,
    clientId: undefined,
    clientName: undefined,
  });

  // Only alert admins on meaningful milestones (completion), not every drag.
  if (status === "completed") {
    await createNotificationForAdmins({
      title: "Task completed",
      message: `Task ${task.title || "Untitled task"} in the project was completed.`,
      type: "task",
      relatedId: `/admin/projects/${task.project_id}`,
    });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

