import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, serviceRoleConfigured } from "@/lib/supabaseAdmin";

async function requireAdmin(request: NextRequest) {
  if (!serviceRoleConfigured) {
    return {
      error: NextResponse.json(
        { error: "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set." },
        { status: 500 }
      ),
      user: null,
    };
  }

  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  const { data: authData, error: authErr } =
    await supabaseAdmin.auth.getUser(token);
  if (authErr || !authData.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (profErr || profile?.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }

  return { error: null, user: authData.user };
}

export async function PATCH(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  let body: {
    id?: string;
    reply?: string | null;
    approved?: boolean;
    replied_at?: string | null;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.id) {
    return NextResponse.json({ error: "Review id is required." }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (typeof body.reply !== "undefined") patch.reply = body.reply;
  if (typeof body.approved !== "undefined") patch.approved = body.approved;
  if (typeof body.replied_at !== "undefined") patch.replied_at = body.replied_at;

  const { data, error } = await supabaseAdmin
    .from("reviews")
    .update(patch)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, review: data });
}

export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard.error) return guard.error;

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Review id is required." }, { status: 400 });
  }

  const { error } = await supabaseAdmin.from("reviews").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
