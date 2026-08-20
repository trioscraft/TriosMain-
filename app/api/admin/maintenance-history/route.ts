import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { MaintenanceHistory } from "@/types/admin/settings";

export const dynamic = "force-dynamic";

const SCOPES = ["client", "member", "both"];
const TYPES = ["scheduled", "emergency", "updating"];
const MAX_ROWS = 30;

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("maintenance_history")
    .select("*")
    .order("ended_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    return NextResponse.json({ history: [] }, { status: 200 });
  }
  return NextResponse.json({ history: (data as MaintenanceHistory[]) || [] });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const started_at = typeof body.started_at === "string" ? body.started_at : null;
  const ended_at = typeof body.ended_at === "string" ? body.ended_at : null;
  const scope = SCOPES.includes(body.scope as string) ? (body.scope as string) : "both";
  const type = TYPES.includes(body.type as string) ? (body.type as string) : "scheduled";
  const message = typeof body.message === "string" ? body.message : null;
  const reopen_minutes =
    typeof body.reopen_minutes === "number" ? Math.max(0, Math.floor(body.reopen_minutes)) : null;

  if (!started_at || !ended_at) {
    return NextResponse.json(
      { message: "started_at and ended_at are required." },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("maintenance_history")
    .insert({ started_at, ended_at, scope, type, message, reopen_minutes })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ record: data as MaintenanceHistory });
}
