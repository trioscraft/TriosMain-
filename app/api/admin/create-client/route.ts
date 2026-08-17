import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin, serviceRoleConfigured } from "@/lib/supabaseAdmin";

type CreateClientBody = {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  status?: string;
  login_email?: string;
  login_password?: string;
};

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

  let body: CreateClientBody;
  try {
    body = (await request.json()) as CreateClientBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const companyName = (body.company_name || "").trim();
  const loginEmail = (body.login_email || "").trim();
  const loginPassword = body.login_password || "";

  if (!companyName) {
    return NextResponse.json(
      { error: "Company name is required." },
      { status: 400 }
    );
  }
  if (!loginEmail || !loginPassword) {
    return NextResponse.json(
      { error: "Client login email and password are required." },
      { status: 400 }
    );
  }
  if (loginPassword.length < 6) {
    return NextResponse.json(
      { error: "Client password must be at least 6 characters." },
      { status: 400 }
    );
  }

  // 1. Create the client portal login (auth user + identities).
  const { data: newUser, error: createErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: loginEmail,
      password: loginPassword,
      email_confirm: true,
      user_metadata: { name: (body.contact_name || companyName).trim() },
    });
  if (createErr || !newUser.user) {
    return NextResponse.json(
      { error: createErr?.message || "Failed to create client login." },
      { status: 400 }
    );
  }
  const uid = newUser.user.id;

  // 2. Create the client company record.
  const { data: client, error: clientErr } = await supabaseAdmin
    .from("clients")
    .insert([
      {
        company_name: companyName,
        contact_name: (body.contact_name || "").trim() || null,
        email: (body.email || "").trim() || null,
        phone: (body.phone || "").trim() || null,
        address: (body.address || "").trim() || null,
        notes: (body.notes || "").trim() || null,
        status: body.status || "active",
      },
    ])
    .select("id")
    .single();
  if (clientErr || !client) {
    return NextResponse.json(
      { error: clientErr?.message || "Failed to create client." },
      { status: 400 }
    );
  }

  // 3. Link the login to the company and mark it as a client.
  const { error: cuErr } = await supabaseAdmin.from("client_users").insert([
    {
      id: uid,
      client_id: client.id,
      email: loginEmail,
      name: (body.contact_name || companyName).trim(),
      role: "client",
    },
  ]);
  const { error: pErr } = await supabaseAdmin
    .from("profiles")
    .upsert(
      [
        {
          id: uid,
          email: loginEmail,
          name: (body.contact_name || companyName).trim(),
          role: "client",
        },
      ],
      { onConflict: "id" }
    );
  if (cuErr || pErr) {
    return NextResponse.json(
      { error: cuErr?.message || pErr?.message || "Failed to link client." },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, id: client.id });
}
