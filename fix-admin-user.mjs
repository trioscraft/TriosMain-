/**
 * fix-admin-user.mjs
 *
 * Repairs the broken admin account created by the raw SQL INSERT in
 * supabase/setup.sql. That insert left `raw_app_meta_data` /
 * `raw_user_meta_data` NULL and never created a matching `auth.identities`
 * row — both required by Supabase Auth (GoTrue) to read the user back out
 * at login time. This is the documented cause of "Database error querying
 * schema" on sign-in.
 *
 * This script does NOT touch auth.* tables directly. It uses the official
 * Supabase Auth Admin API (service role key), which sets up auth.users and
 * auth.identities correctly.
 *
 * Usage:
 *   1. npm install @supabase/supabase-js   (if not already a dependency)
 *   2. SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node fix-admin-user.mjs
 *      (service role key is in Supabase Dashboard -> Project Settings -> API
 *      -- NEVER expose this key client-side or commit it)
 *   3. Delete this script and supabase/setup.sql's admin-bootstrap block
 *      afterwards; don't leave a hardcoded password in the repo.
 */

import { createClient } from "@supabase/supabase-js";

const ADMIN_EMAIL = "trioscraft2025@gmail.com";
const ADMIN_PASSWORD = "QWERTY"; // change this after logging in once
const OLD_ADMIN_EMAIL = "rahulx122003@gmail.com";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars. See header comment."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // 1. Find and remove the broken user (and its dependent rows) if it exists.
  const { data: existingUsers, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const broken = existingUsers.users.find(
    (u) => u.email === ADMIN_EMAIL || u.email === OLD_ADMIN_EMAIL
  );
  if (broken) {
    console.log(`Found existing (likely broken) user ${broken.id} — deleting...`);
    // Deleting via the Admin API correctly cleans up auth.identities too,
    // unlike the raw SQL insert that created it.
    const { error: delErr } = await supabase.auth.admin.deleteUser(broken.id);
    if (delErr) throw delErr;
  }

  // 2. Recreate the user properly — this sets raw_app_meta_data,
  //    raw_user_meta_data, and the auth.identities row correctly.
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true, // skip email confirmation, same intent as the old script
    user_metadata: { name: "Admin" },
  });
  if (createErr) throw createErr;

  console.log(`Created user ${created.user.id}`);

  // 3. Promote the auto-created profile row to admin (your handle_new_user
  //    trigger already creates a 'member' profile row on insert).
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", created.user.id);
  if (profileErr) throw profileErr;

  console.log("Promoted profile to role=admin. Done — try logging in now.");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
