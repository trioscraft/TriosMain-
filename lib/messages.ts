import { supabase } from "@/lib/supabase";
import type { ClientMessage } from "@/lib/types/admin/client";

export async function getClientMessages(clientId: string): Promise<ClientMessage[]> {
  const { data, error } = await supabase
    .from("client_messages")

    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load client messages:", error);
    return [];
  }

  return data || [];
}

export async function sendClientMessage(
  clientUserId: string,
  clientId: string,
  body: string
): Promise<ClientMessage | null> {
  const { data, error } = await supabase
    .from("client_messages")
    .insert([
      {
        client_user_id: clientUserId,

      client_id: clientId,
      sender: "client",
      body,
      reply: null,
    },
  ]).select("*").single();

  if (error) {
    console.error("Failed to send client message:", error);
    return null;
  }

  return data;
}

export async function replyToClientMessage(
  messageId: string,
  reply: string
): Promise<ClientMessage | null> {
  const { data, error } = await supabase
.from("client_messages")
    .update({ reply })

    .eq("id", messageId)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to reply to client message:", error);
    return null;
  }

  return data;
}
