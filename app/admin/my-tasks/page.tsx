"use client";

import { useEffect, useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  title?: string;
  status?: string;
  progress?: number | null;
};

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("assigned_to", user.id);

      setTasks(data || []);
    })();
  }, []);

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div>
      <h1 className="text-4xl font-bold mb-6">
        My Tasks
      </h1>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-900 p-4 rounded"
          >
            <h3>{task.title}</h3>

            <p>Status: {task.status}</p>

            <p>Progress: {task.progress}%</p>
          </div>
        ))}
      </div>
    </div>
    </RoleGuard>
  );
}