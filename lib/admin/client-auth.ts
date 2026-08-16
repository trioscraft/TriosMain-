import { supabase } from "@/lib/supabase";
import type { ClientUser } from "@/lib/types/admin/client";

export async function getCurrentClientUser(): Promise<ClientUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.trim().toLowerCase();
  const userId = user?.id;

  if (!userId && !email) {
    return null;
  }

  if (userId) {
    const { data, error } = await supabase
      .from("client_users")
      .select("*")
      .eq("id", userId)
      .single();


    if (!error && data) {
      return data;
    }
  }

  if (email) {
    const { data, error } = await supabase
      .from("client_users")

      .select("*")
      .ilike("email", email)
      .single();

    if (!error && data) {
      return data;
    }
  }

  return null;
}
