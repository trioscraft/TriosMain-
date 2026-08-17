"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Pencil, Trash2, Building2, Mail, Phone, ArrowRight } from "lucide-react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { createNotificationForAdmins } from "@/lib/admin/notifications";
import ClientForm, { ClientData, ClientFormValues } from "@/components/ClientForm";
import EditClientModal from "@/components/EditClientModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { PageHeader, Card } from "@/components/admin/ui/Card";
import { EmptyState } from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";
import Badge from "@/components/admin/ui/Badge";
import { Avatar } from "@/components/admin/ui/Avatar";
import { Modal } from "@/components/admin/ui/Modal";

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
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
    if (!error) setClients(data || []);
    setLoading(false);
  }

  async function handleCreateClient(values: ClientFormValues) {
    if (!values.company_name.trim()) {
      alert("Company name is required.");
      return;
    }

    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch("/api/admin/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token || ""}` },
        body: JSON.stringify(values),
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error || "Unable to create client.");
        setSaving(false);
        return;
      }

      // Refresh the list immediately so the new client shows up.
      setShowCreate(false);
      await loadClients();
      setSaving(false);

      // Best-effort extras — don't block the refresh if these fail.
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        let userName = "Unknown";
        const userId = user?.id ?? "";
        if (user?.email) {
          const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
          if (profile?.name) userName = profile.name;
        }

        await logActivity({ userId, userName, action: `created client ${values.company_name}`, clientId: json.id, clientName: values.company_name });
        await createNotificationForAdmins({
          title: "New client added",
          message: `Client ${values.company_name} was added to the CRM.`,
          type: "client",
          relatedId: `/admin/clients/${json.id}`,
        });
      } catch (extraErr) {
        console.warn("Activity/notification logging failed:", extraErr);
      }
    } catch (err) {
      console.error("Create client failed:", err);
      alert("Something went wrong creating the client.");
    }
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
        const { data: profile } = await supabase.from("profiles").select("name").eq("email", user.email).single();
        if (profile?.name) userName = profile.name;
      }
      await logActivity({ userId, userName, action: `deleted client ${deletedClient.company_name}`, clientId: deletedClient.id, clientName: deletedClient.company_name });
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
      <div style={{ maxWidth: "1000px", animation: "fadeUp 0.5s ease both" }}>
        <PageHeader
          title="Clients"
          subtitle={`${clients.length} client${clients.length !== 1 ? "s" : ""} in the CRM.`}
          icon={<Users size={22} />}
          actions={
            <Button variant="primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> New Client
            </Button>
          }
        />

        <div style={{ position: "relative", marginBottom: 24, maxWidth: 460 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
          <input className="input" placeholder="Search company, contact, or email" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: 14 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="skeleton" style={{ height: 110, animationDelay: `${index * 80}ms` }} />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            icon={<Building2 size={24} />}
            title={search ? "No matching clients" : "No clients yet"}
            description={search ? "Adjust your search to find a profile." : "Create a new client to start tracking projects and invoices."}
            action={
              !search && (
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                  <Plus size={16} /> New Client
                </Button>
              )
            }
          />
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filteredClients.map((client) => (
              <Card key={client.id} interactive style={{ padding: 22 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", gap: 14, minWidth: 0, flex: 1 }}>
                    <Avatar name={client.company_name} size={44} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{client.company_name}</div>
                      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{client.contact_name || "No contact name"}</div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: "var(--text-tertiary)" }}>
                        {client.email && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Mail size={13} /> {client.email}
                          </span>
                        )}
                        {client.phone && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <Phone size={13} /> {client.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
                    <Badge tone={client.status === "active" ? "green" : "red"} dot>
                      {client.status}
                    </Badge>
                    <Link href={`/admin/clients/${client.id}`} className="btn" style={{ padding: "9px 14px", gap: 6 }}>
                      Details <ArrowRight size={14} />
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setEditClient(client)} leftIcon={<Pencil size={14} />}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setDeleteClientId(client.id)} leftIcon={<Trash2 size={14} />}>
                      Delete
                    </Button>
                  </div>
                </div>
                {client.address ? <div style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 12 }}>{client.address}</div> : null}
              </Card>
            ))}
          </div>
        )}

        <Modal
          open={showCreate}
          onClose={() => setShowCreate(false)}
          title="New Client"
          size="lg"
          footer={null}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: -8, marginBottom: 18 }}>
            Add a business to your CRM and create their portal login.
          </p>
          <ClientForm
            onSubmit={handleCreateClient}
            onCancel={() => setShowCreate(false)}
            submitting={saving}
            submitLabel={saving ? "Creating..." : "Create Client"}
          />
        </Modal>

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
