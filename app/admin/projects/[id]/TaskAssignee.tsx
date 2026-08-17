"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import { createNotification } from "@/lib/admin/notifications";

type Profile = {
  id: string;
  name: string;
};

export default function TaskAssignee({
  taskId,
  taskTitle,
  projectId,
  projectName,
}: {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
}) {
  const [profiles, setProfiles] = useState<
    Profile[]
  >([]);

  const [selectedUser, setSelectedUser] =
    useState("");

  useEffect(() => {
    void (async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id,name");

      setProfiles(profileData || []);

      const { data: taskData } = await supabase
        .from("tasks")
        .select("assigned_to")
        .eq("id", taskId)
        .single();

      if (taskData?.assigned_to) {
        setSelectedUser(taskData.assigned_to);
      }
    })();
  }, [taskId]);

  async function assignUser(userId: string) {
    setSelectedUser(userId);

    const { error } = await supabase
      .from("tasks")
      .update({
        assigned_to: userId,
      })
      .eq("id", taskId);

    if (error) {
      alert(error.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userIdValue = user?.id ?? "";
    let userName = "Unknown";

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
      userId: userIdValue,
      userName,
      action: `assigned task ${taskTitle}`,
      projectId,
      projectName,
    });

    if (userId) {
      await createNotification({
        userId,
        title: "Task assigned",
        message: `You were assigned to task ${taskTitle} in project ${projectName}.`,
        type: "task",
        relatedId: `/admin/projects/${projectId}`,
      });
    }
  }

  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "12px",
          marginBottom: "6px",
          color: "var(--text-tertiary)",
        }}
      >
        Assigned To
      </label>

      <select
        value={selectedUser}
        onChange={(e) =>
          assignUser(e.target.value)
        }
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "8px",
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          border: "1px solid var(--border)",
        }}
      >
        <option value="">
          Select Member
        </option>

        {profiles.map((profile) => (
          <option
            key={profile.id}
            value={profile.id}
          >
            {profile.name}
          </option>
        ))}
      </select>
    </div>
  );
}