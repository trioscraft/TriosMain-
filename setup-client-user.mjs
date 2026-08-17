/**
 * setup-client-user.mjs
 *
 * Creates a client user account and links it to a client record.
 * This uses the Supabase Auth Admin API (service role key) to properly
 * set up auth.users and auth.identities, then creates the client_users
 * and clients records.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node setup-client-user.mjs
 */

import { createClient } from "@supabase/supabase-js";

const CLIENT_EMAIL = "7034006336rajs@gmail.com";
const CLIENT_PASSWORD = "QWERTY";
const CLIENT_NAME = "Rajs Client";
const COMPANY_NAME = "Rajs Company";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Setting up client user:", CLIENT_EMAIL);

  // 1. Check if user already exists
  const { data: existingUsers, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw listErr;

  const existing = existingUsers.users.find(u => u.email === CLIENT_EMAIL);
  let userId;

  if (existing) {
    console.log(`User already exists with ID ${existing.id} - deleting...`);
    const { error: delErr } = await supabase.auth.admin.deleteUser(existing.id);
    if (delErr) throw delErr;
  }

  // 2. Create the auth user
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email: CLIENT_EMAIL,
    password: CLIENT_PASSWORD,
    email_confirm: true,
    user_metadata: { name: CLIENT_NAME },
  });
  if (createErr) throw createErr;

  userId = created.user.id;
  console.log(`Created auth user ${userId}`);

  // 3. Create or find the client record
  const { data: existingClient, error: clientCheckErr } = await supabase
    .from("clients")
    .select("*")
    .ilike("email", CLIENT_EMAIL)
    .single();

  let clientId;

  if (existingClient && !clientCheckErr) {
    clientId = existingClient.id;
    console.log(`Using existing client record ${clientId}`);
  } else {
    const { data: newClient, error: clientCreateErr } = await supabase
      .from("clients")
      .insert({
        company_name: COMPANY_NAME,
        contact_name: CLIENT_NAME,
        email: CLIENT_EMAIL,
        status: "active",
      })
      .select()
      .single();
    
    if (clientCreateErr) throw clientCreateErr;
    clientId = newClient.id;
    console.log(`Created client record ${clientId}`);
  }

  // 4. Create the client_users record linking auth user to client
  const { error: clientUserErr } = await supabase
    .from("client_users")
    .insert({
      id: userId,
      client_id: clientId,
      email: CLIENT_EMAIL,
      name: CLIENT_NAME,
      role: "client",
    });
  
  if (clientUserErr) throw clientUserErr;
  console.log("Created client_users record");

  // 5. Update profile to client role
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: "client" })
    .eq("id", userId);
  
  if (profileErr) throw profileErr;
  console.log("Updated profile role to 'client'");

  console.log("\n✅ Client user setup complete!");
  console.log(`   Email: ${CLIENT_EMAIL}`);
  console.log(`   Password: ${CLIENT_PASSWORD}`);
  console.log(`   Login URL: /admin/login`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
