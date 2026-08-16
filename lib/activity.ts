import { supabase } from "@/lib/supabase";

type ActivityPayload = {
  userId: string;
  userName: string;
  action: string;
  projectId?: string;
  projectName?: string;
  clientId?: string;
  clientName?: string;
  quotationId?: string;
  invoiceId?: string;
};

export async function logActivity({
  userId,
  userName,
  action,
  projectId,
  projectName,
  clientId,
  clientName,
  quotationId,
  invoiceId,
}: ActivityPayload) {
  const { data, error } = await supabase.from("activities").insert([
    {
      user_id: userId,
      user_name: userName,
      action,
      project_id: projectId,
      project_name: projectName,
      client_id: clientId,
      client_name: clientName,
      quotation_id: quotationId,
      invoice_id: invoiceId,
    },
  ]);

  if (error) {
    console.error("Failed to log activity:", error);
  }

  return { data, error };
}
