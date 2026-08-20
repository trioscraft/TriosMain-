import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { AppSettings, SettingsInput } from "@/types/admin/settings";

export const dynamic = "force-dynamic";

const WRITABLE_COLUMNS = [
  "company_name",
  "business_email",
  "phone",
  "address",
  "currency",
  "timezone",
  "date_format",
  "sender_name",
  "sender_email",
  "notify_new_client",
  "notify_project_updates",
  "notify_invoice_paid",
  "notify_reviews",
  "notify_mentions",
  "maintenance_mode",
  "maintenance_scope",
  "maintenance_type",
  "maintenance_message",
  "maintenance_ends_at",
  "maintenance_reopen_at",
  "maintenance_started_at",
];

const DEFAULTS: Record<string, unknown> = {
  id: 1,
  company_name: "Trios Craft",
  business_email: "",
  phone: "",
  address: "",
  currency: "INR",
  timezone: "Asia/Kolkata",
  date_format: "DD MMM YYYY",
  sender_name: "Trios Craft",
  sender_email: "",
  notify_new_client: true,
  notify_project_updates: true,
  notify_invoice_paid: true,
  notify_reviews: true,
  notify_mentions: true,
  maintenance_mode: false,
  maintenance_scope: "both",
  maintenance_type: "scheduled",
  maintenance_message: "",
  maintenance_ends_at: null,
  maintenance_reopen_at: null,
  maintenance_started_at: null,
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function readSettings(): Promise<{
  data: AppSettings | null;
  missingTable: boolean;
}> {
  const { data, error } = await supabaseAdmin
    .from("settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    // Table does not exist yet (migration not applied).
    if ((error as { code?: string }).code === "42P01") {
      return { data: null, missingTable: true };
    }
    // Any other error — fall back to defaults so the UI still works.
    return { data: null, missingTable: true };
  }

  if (!data) {
    const { data: created, error: insErr } = await supabaseAdmin
      .from("settings")
      .insert(DEFAULTS)
      .select("*")
      .single();
    if (insErr) {
      return {
        data: null,
        missingTable: (insErr as { code?: string }).code === "42P01",
      };
    }
    return { data: created as AppSettings, missingTable: false };
  }

  return { data: data as AppSettings, missingTable: false };
}

export async function GET() {
  const { data, missingTable } = await readSettings();

  if (missingTable || !data) {
    return NextResponse.json(
      {
        settings: { ...DEFAULTS, updated_at: null, updated_by: null } as AppSettings,
        persisted: false,
        missingTable,
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    { settings: data, persisted: true, missingTable: false },
    { status: 200 },
  );
}

export async function PUT(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: SettingsInput = {};
  for (const key of WRITABLE_COLUMNS) {
    if (key in body) {
      (patch as Record<string, unknown>)[key] = body[key];
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json(
      { message: "No valid fields provided." },
      { status: 400 },
    );
  }

  if (
    typeof patch.business_email === "string" &&
    patch.business_email &&
    !EMAIL_RE.test(patch.business_email)
  ) {
    return NextResponse.json(
      { message: "Business email is invalid." },
      { status: 400 },
    );
  }

  if (
    typeof patch.sender_email === "string" &&
    patch.sender_email &&
    !EMAIL_RE.test(patch.sender_email)
  ) {
    return NextResponse.json(
      { message: "Sender email is invalid." },
      { status: 400 },
    );
  }

  if (
    typeof patch.currency === "string" &&
    !["INR", "USD", "EUR", "GBP", "AED"].includes(patch.currency)
  ) {
    return NextResponse.json({ message: "Invalid currency." }, { status: 400 });
  }

  if (
    typeof patch.maintenance_scope === "string" &&
    !["client", "member", "both"].includes(patch.maintenance_scope)
  ) {
    return NextResponse.json({ message: "Invalid maintenance scope." }, { status: 400 });
  }

  if (
    typeof patch.maintenance_type === "string" &&
    !["scheduled", "emergency", "updating"].includes(patch.maintenance_type)
  ) {
    return NextResponse.json({ message: "Invalid maintenance type." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("settings")
    .upsert({ id: 1, ...patch } as Record<string, unknown>, {
      onConflict: "id",
    })
    .select("*")
    .single();

  if (error) {
    if ((error as { code?: string }).code === "42P01") {
      return NextResponse.json(
        {
          message:
            "Settings table not found. Apply the supabase/migrations/018_settings_table.sql migration.",
          missingTable: true,
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { settings: data as AppSettings, persisted: true },
    { status: 200 },
  );
}
