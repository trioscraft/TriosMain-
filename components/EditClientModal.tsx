"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import ClientForm, { ClientData, ClientFormValues } from "./ClientForm";

type EditClientModalProps = {
  open: boolean;
  client: ClientData;
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditClientModal({
  open,
  client,
  onClose,
  onSaved,
}: EditClientModalProps) {
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", userResponse.user.email)
        .single();

      if (profile?.name) {
        userName = profile.name;
      }
    }

    const { error } = await supabase
      .from("clients")
      .update({
        ...values,
      })
      .eq("id", client.id);

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

    if (onSaved) {
      onSaved();
    }

    router.refresh();
  }

  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          background: "var(--bg-surface)",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          padding: "28px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              Edit Client
            </div>
            <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
              Update contact details and client status.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "24px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        <ClientForm
          initialData={client}
          onSubmit={handleSave}
          onCancel={onClose}
          submitting={submitting}
          submitLabel={submitting ? "Saving..." : "Update Client"}
        />
      </div>
    </div>
  );
}
