import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, serviceRoleConfigured } from "@/lib/supabaseAdmin";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!serviceRoleConfigured) {
    return NextResponse.json(
      {
        error:
          "Server misconfiguration: SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local and restart the dev server.",
      },
      { status: 500 }
    );
  }

  // Verify the caller is an authenticated admin using the session token.
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

  const { data: profile, error: profErr } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();
  if (profErr || profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error: uploadErr } = await supabaseAdmin.storage
    .from("portfolio-images")
    .upload(path, arrayBuffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadErr) {
    console.error("Portfolio upload failed:", uploadErr);
    return NextResponse.json(
      {
        error:
          "Upload failed. Make sure the 'portfolio-images' bucket exists in Supabase (Storage), then try again.",
      },
      { status: 500 }
    );
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("portfolio-images")
    .getPublicUrl(path);

  return NextResponse.json({ ok: true, url: urlData.publicUrl });
}