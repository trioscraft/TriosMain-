import { supabase } from "@/lib/supabase";

type NotificationPayload = {
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string | null;
};

export async function createNotification({
  userId,
  title,
  message,
  type,
  relatedId = null,
}: NotificationPayload) {
  const { error } = await supabase.from("notifications").insert([
    {
      user_id: userId,
      title,
      message,
      type,
      related_id: relatedId,
      is_read: false,
    },
  ]);

  if (error) {
    console.error("Failed to create notification:", error);
  }
}

export async function createNotificationForAdmins({
  title,
  message,
  type,
  relatedId = null,
}: Omit<NotificationPayload, "userId">) {
  const { data: admins, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");

  if (error) {
    console.error("Failed to load admin profiles for notification:", error);
    return;
  }

  if (!admins || admins.length === 0) {
    return;
  }

  const notifications = admins.map((admin) => ({
    user_id: admin.id,
    title,
    message,
    type,
    related_id: relatedId,
    is_read: false,
  }));

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("Failed to create notifications for admins:", insertError);
  }
}

export async function createNotificationForClient({
  clientId,
  title,
  message,
  type,
  relatedId = null,
}: {
  clientId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string | null;
}) {
  const { data: clientUsers, error } = await supabase
    .from("client_users")
    .select("id")
    .eq("client_id", clientId)
    .eq("role", "client");

  if (error) {
    console.error("Failed to load client users for notification:", error);
    return;
  }

  if (!clientUsers || clientUsers.length === 0) {
    return;
  }

  const notifications = clientUsers.map((clientUser) => ({
    user_id: clientUser.id,
    title,
    message,
    type,
    related_id: relatedId,
    is_read: false,
  }));

  const { error: insertError } = await supabase
    .from("notifications")
    .insert(notifications);

  if (insertError) {
    console.error("Failed to create notifications for client users:", insertError);
  }
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);

  if (error) {
    console.error("Failed to mark notification read:", error);
  }
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    console.error("Failed to mark all notifications read:", error);
  }
}

export async function getUserNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    // If notifications table isn't present in this environment/schema,
    // return empty list instead of crashing NotificationBell.
    console.warn("Failed to load notifications (returning empty):", {
      message: error.message,
      code: (error as { code?: unknown })?.code,
    });
    return [];
  }

  return data ?? [];
}

