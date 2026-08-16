export interface Project {
  id: string;
  client_id?: string | null;
  name: string;
  description?: string | null;
  budget?: number | null;
  status: string;
  progress: number;
  start_date: string | null;
  due_date: string | null;
}

