export type ClientUserRole = "client";

export interface ClientUser {
  id: string;
  client_id: string;
  email: string;
  role: ClientUserRole;
  created_at: string;
}

export interface ClientMessage {
  id: string;
  client_id: string;
  client_user_id: string;
  sender: "client" | "admin";
  body: string;
  reply: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientReportRow {
  id: string;
  label: string;
  type: "project" | "invoice";
  status: string;
  available_at: string;
}

export interface Client {
  id: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string | null;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
  budget?: number | null;
  description?: string | null;
}

