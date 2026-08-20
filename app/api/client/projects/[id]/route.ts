import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, serviceRoleConfigured } from "@/lib/supabaseAdmin";

type UpdateBody = {
  due_date?: string | null;
  budget?: number | null;
  description?: string | null;
  start_date?: string | null;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!serviceRoleConfigured) {
    return NextResponse.json(
      { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set." },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // The caller must be a client user linked to the company that owns this project.
  const { data: clientUser, error: cuErr } = await supabaseAdmin
    .from("client_users")
    .select("client_id")
    .eq("id", authData.user.id)
    .single();
  if (cuErr || !clientUser?.client_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: project, error: projErr } = await supabaseAdmin
    .from("projects")
    .select("id, client_id")
    .eq("id", id)
    .single();
  if (projErr || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.client_id !== clientUser.client_id) {
    return NextResponse.json(
      { error: "You do not have access to this project." },
      { status: 403 }
    );
  }

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const updates: Record<string, string | number | null> = {};
  if ("due_date" in body) updates.due_date = body.due_date ?? null;
  if ("budget" in body) {
    const budget = body.budget;
    if (typeof budget !== "number" || isNaN(budget) || budget < 0) {
      return NextResponse.json(
        { error: "Budget must be a valid non-negative amount." },
        { status: 400 }
      );
    }
    updates.budget = budget;
  }
  if ("description" in body) updates.description = body.description ?? null;
  if ("start_date" in body) updates.start_date = body.start_date ?? null;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select(
      "id, name, description, progress, status, start_date, due_date, budget, created_at"
    )
    .maybeSingle();

  if (updateErr || !updated) {
    return NextResponse.json(
      { error: updateErr?.message || "Failed to save changes." },
      { status: 500 }
    );
  }

  return NextResponse.json({ project: updated });
}
