"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import ClientForm, { ClientData, ClientFormValues } from "./ClientForm";
import { Modal } from "@/components/admin/ui/Modal";

type EditClientModalProps = {
  open: boolean;
  client: ClientData;
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditClientModal({ open, client, onClose, onSaved }: EditClientModalProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleSave(values: ClientFormValues) {
    if (!values.company_name.trim()) {
      alert("Company name is required.");
      return;
    }

    setSubmitting(true);

    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse?.user?.id ?? "";
    let userName = "Unknown";

    if (userResponse?.user?.email) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("email", userResponse.user.email).single();
      if (profile?.name) userName = profile.name;
    }

    const { error } = await supabase.from("clients").update({ ...values }).eq("id", client.id);

    if (error) {
      alert(error.message);
      setSubmitting(false);
      return;
    }

    await logActivity({
      userId,
      userName,
      action: `updated client ${values.company_name}`,
      clientId: client.id,
      clientName: values.company_name,
    });

    setSubmitting(false);
    onClose();
    if (onSaved) onSaved();
    router.refresh();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Client"
      size="lg"
      footer={null}
    >
      <ClientForm
        initialData={client}
        onSubmit={handleSave}
        onCancel={onClose}
        submitting={submitting}
        submitLabel={submitting ? "Saving..." : "Update Client"}
      />
    </Modal>
  );
}
