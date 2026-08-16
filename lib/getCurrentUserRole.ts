import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "member" | "client";

export async function getCurrentUserRole(
  email?: string,
  userId?: string
): Promise<UserRole | null> {
  let userEmail = email?.trim().toLowerCase();
  let currentUserId = userId?.trim();

  if (!userEmail || !currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!userEmail && user?.email) {
      userEmail = user.email.trim().toLowerCase();
    }

    if (!currentUserId && user?.id) {
      currentUserId = user.id;
    }
  }

  if (!userEmail || !currentUserId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!userEmail && session?.user?.email) {
      userEmail = session.user.email.trim().toLowerCase();
    }

    if (!currentUserId && session?.user?.id) {
      currentUserId = session.user.id;
    }
  }

  console.log(
    "getCurrentUserRole - user email:",
    userEmail,
    "user id:",
    currentUserId
  );

  if (!userEmail && !currentUserId) {
    return null;
  }

  const profileQuery = supabase.from("profiles").select("role");
  const profileQueryWithKey = currentUserId
    ? profileQuery.eq("id", currentUserId)
    : profileQuery.ilike("email", userEmail || "");

  const { data: profile, error: profileError } = await profileQueryWithKey.single();

  if (!profileError && profile?.role) {
    const normalizedRole = String(profile.role).trim().toLowerCase();

    if (normalizedRole === "admin") {
      return "admin";
    }

    if (normalizedRole === "member") {
      return "member";
    }

    if (normalizedRole === "client") {
      return "client";
    }
  }

  if (currentUserId) {
    const { data: clientUser, error: clientError } = await supabase
      .from("client_users")
      .select("role")
      .eq("id", currentUserId)
      .single();

    if (!clientError && clientUser?.role === "client") {
      return "client";
    }
  }

  if (userEmail) {
    const { data: clientUser, error: clientError } = await supabase
      .from("client_users")
      .select("role")
      .ilike("email", userEmail)
      .single();

    if (!clientError && clientUser?.role === "client") {
      return "client";
    }
  }

  return null;
}
