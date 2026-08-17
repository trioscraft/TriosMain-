import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY is not set — /api/admin/create-client will fail until it is added to .env.local."
  );
}

// Server-only client with the service-role key. NEVER import this in a
// client component — the key must not reach the browser.
export const supabaseAdmin = createClient(
  url || "http://localhost:54321",
  serviceKey || "missing-service-role-key"
);

export const serviceRoleConfigured = Boolean(
  url && serviceKey && serviceKey !== "missing-service-role-key"
);
