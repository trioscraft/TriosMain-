"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { Modal } from "@/components/admin/ui/Modal";
import { Field, Input, Select, Textarea } from "@/components/admin/ui/Field";
import Button from "@/components/admin/ui/Button";

export type ProjectData = {
  id: string;
  name: string;
  description: string;
  budget: number;
  status: string;
  client_id?: string | null;
};

type EditProjectModalProps = {
  open: boolean;
  project: ProjectData;
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditProjectModal({ open, project, onClose, onSaved }: EditProjectModalProps) {
  const router = useRouter();

  const [name, setName] = useState(project.name || "");
  const [description, setDescription] = useState(project.description || "");
  const [budget, setBudget] = useState(String(project.budget || 0));
  const [status, setStatus] = useState(project.status || "active");
  const [clientId, setClientId] = useState(project.client_id || "");
  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  async function loadClients() {
    const { data } = await supabase.from("clients").select("id, company_name").order("company_name", { ascending: true });
    if (data) setClients(data);
  }

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setName(project.name || "");
      setDescription(project.description || "");
      setBudget(String(project.budget || 0));
      setStatus(project.status || "active");
      setClientId(project.client_id || "");
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => void loadClients(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  async function handleSave() {
    if (!name.trim()) {
      alert("Project name is required.");
      return;
    }
    setSaving(true);
    const { data: userResponse } = await supabase.auth.getUser();
    const userId = userResponse?.user?.id ?? "";
    let userName = "Unknown";
    if (userResponse?.user?.email) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("email", userResponse.user.email).single();
      if (profile?.name) userName = profile.name;
    }
    const { error } = await supabase
      .from("projects")
      .update({ name: name.trim(), description: description.trim(), budget: Number(budget) || 0, status: status as string, client_id: clientId || null })
      .eq("id", project.id);
    if (error) {
      alert(error.message);
      setSaving(false);
      return;
    }
    await logActivity({ userId, userName, action: `updated project ${name.trim()}`, projectId: project.id, projectName: name.trim() });
    setSaving(false);
    onClose();
    if (onSaved) onSaved();
    router.refresh();
  }

  return (
    <Modal open={open} onClose={onClose} title="Edit Project" size="lg" footer={null}>
      <p style={{ color: "var(--text-secondary)", fontSize: 13.5, marginTop: -8, marginBottom: 18 }}>Update project details and save changes.</p>
      <div style={{ display: "grid", gap: 16 }}>
        <Field label="Project Name" htmlFor="pname" required>
          <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Description" htmlFor="pdesc">
          <Textarea id="pdesc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Client" htmlFor="pclient">
          <Select id="pclient" value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Unassigned</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.company_name}
              </option>
            ))}
          </Select>
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Field label="Budget (₹)" htmlFor="pbudget">
            <Input id="pbudget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </Field>
          <Field label="Status" htmlFor="pstatus">
            <Select id="pstatus" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="todo">Todo</option>
            </Select>
          </Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <Button variant="ghost" onClick={onClose} disabled={saving} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving} disabled={!name.trim()} style={{ flex: 1 }}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
