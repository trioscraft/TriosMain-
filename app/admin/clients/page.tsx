"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { createNotificationForAdmins } from "@/lib/admin/notifications";
import ClientForm, { ClientData, ClientFormValues } from "@/components/ClientForm";
import EditClientModal from "@/components/EditClientModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editClient, setEditClient] = useState<ClientData | null>(null);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    void loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setClients(data || []);
    }
    setLoading(false);
  }

  async function handleCreateClient(values: ClientFormValues) {
    if (!values.company_name.trim()) {
      alert("Company name is required.");
      return;
    }

    setSaving(true);
    const { data: result, error } = await supabase
      .from("clients")
      .insert([values])
      .select("*")
      .single();

    if (error || !result) {
      alert(error?.message || "Unable to create client.");
      setSaving(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    let userName = "Unknown";
    const userId = user?.id ?? "";

    if (user?.email) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", user.email)
        .single();

      if (profile?.name) {
        userName = profile.name;
      }
    }

    await logActivity({
      userId,
      userName,
      action: `created client ${values.company_name}`,
      clientId: result.id,
      clientName: values.company_name,
    });

    await createNotificationForAdmins({
      title: "New client added",
      message: `Client ${values.company_name} was added to the CRM.`,
      type: "client",
      relatedId: `/admin/clients/${result.id}`,
    });

    setClients((current) => [result, ...current]);
    setShowCreate(false);
    setSaving(false);
  }

  async function handleDeleteClient() {
    if (!deleteClientId) return;

    setDeleting(true);
    await supabase.from("projects").update({ client_id: null }).eq("client_id", deleteClientId);
    const { error } = await supabase.from("clients").delete().eq("id", deleteClientId);

    if (error) {
      alert(error.message);
      setDeleting(false);
      return;
    }

    const deletedClient = clients.find((client) => client.id === deleteClientId);
    if (deletedClient) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let userName = "Unknown";
      const userId = user?.id ?? "";

      if (user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("email", user.email)
          .single();

        if (profile?.name) {
          userName = profile.name;
        }
      }

      await logActivity({
        userId,
        userName,
        action: `deleted client ${deletedClient.company_name}`,
        clientId: deletedClient.id,
        clientName: deletedClient.company_name,
      });
    }

    setClients((current) => current.filter((client) => client.id !== deleteClientId));
    setDeleteClientId(null);
    setDeleting(false);
  }

  const filteredClients = clients.filter((client) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      client.company_name.toLowerCase().includes(query) ||
      (client.contact_name || "").toLowerCase().includes(query) ||
      (client.email || "").toLowerCase().includes(query)
    );
  });

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div style={{ maxWidth: "980px", animation: "fadeUp 0.5s ease both" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: "8px" }}>
              Management
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
              }}
            >
              Clients
            </h1>
            <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
              {clients.length} client{clients.length !== 1 ? "s" : ""} in the CRM.
            </p>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            + New Client
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <input
            className="input"
            placeholder="Search company, contact, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: "14px" }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="skeleton"
                style={{ height: "120px", animationDelay: `${index * 80}ms` }}
              />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div
            className="card"
            style={{ padding: "48px", textAlign: "center" }}
          >
            <div style={{ fontSize: "24px", marginBottom: "12px" }}>🧾</div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "18px",
                marginBottom: "8px",
              }}
            >
              No matching clients
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              Create a new client or adjust your search to find a profile.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "14px" }}>
            {filteredClients.map((client) => (
              <div
                key={client.id}
                className="card"
                style={{ padding: "22px", display: "grid", gap: "14px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "6px",
                      }}
                    >
                      {client.company_name}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                      {client.contact_name || "No contact name"}
                    </div>
                    <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", fontSize: "13px", color: "var(--text-tertiary)" }}>
                      <span>{client.email || "No email"}</span>
                      <span>{client.phone || "No phone"}</span>
                      <span>{client.status}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexShrink: 0, flexWrap: "wrap" }}>
                    <Link href={`/admin/clients/${client.id}`} className="btn" style={{ padding: "10px 14px" }}>
                      Details
                    </Link>
                    <button
                      className="btn"
                      onClick={() => setEditClient(client)}
                      style={{ padding: "10px 14px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => setDeleteClientId(client.id)}
                      style={{ padding: "10px 14px", background: "var(--red)", color: "white" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {client.address ? (
                  <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{client.address}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {showCreate && (
          <div
            className="form-overlay"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreate(false);
            }}
          >
            <div className="card" style={{ width: "100%", maxWidth: "560px", padding: "28px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "24px",
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
                    Create Client
                  </div>
                  <p style={{ color: "var(--text-secondary)", marginTop: "6px", fontSize: "14px" }}>
                    Add a new business client to your CRM and connect projects.
                  </p>
                </div>

                <button
                  onClick={() => setShowCreate(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-tertiary)",
                    fontSize: "24px",
                  }}
                >
                  ×
                </button>
              </div>

              <ClientForm
                onSubmit={handleCreateClient}
                onCancel={() => setShowCreate(false)}
                submitting={saving}
                submitLabel={saving ? "Creating..." : "Create Client"}
              />
            </div>
          </div>
        )}

        {editClient && (
          <EditClientModal
            open={Boolean(editClient)}
            client={editClient}
            onClose={() => setEditClient(null)}
            onSaved={async () => {
              await loadClients();
              setEditClient(null);
            }}
          />
        )}

        <ConfirmDeleteModal
          open={Boolean(deleteClientId)}
          title="Delete client"
          description="This will remove the client and disconnect associated projects. This action cannot be undone."
          confirmLabel="Delete client"
          loading={deleting}
          onConfirm={handleDeleteClient}
          onCancel={() => setDeleteClientId(null)}
        />
      </div>
    </RoleGuard>
  );
}
