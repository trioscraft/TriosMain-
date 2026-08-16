"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

type Props = {
  taskId: string;
  taskTitle: string;
  projectId: string;
  projectName: string;
};

export default function DeleteTaskButton({
  taskId,
  taskTitle,
  projectId,
  projectName,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function onDelete() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id || "";
    let userName = "Unknown";

    if (userData?.user?.email) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("name")
        .eq("email", userData.user.email)
        .single();

      if (profileData?.name) {
        userName = profileData.name;
      }
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      setLoading(false);
      setConfirmOpen(false);
      alert(error.message);
      return;
    }

    const { data: remainingTasks, error: tasksError } = await supabase
      .from("tasks")
      .select("progress")
      .eq("project_id", projectId);

    let projectProgress = 0;
    let projectStatus = "todo";

    if (!tasksError && remainingTasks && remainingTasks.length > 0) {
      const total = remainingTasks.reduce(
        (sum, task) => sum + Number(task.progress || 0),
        0
      );
      projectProgress = Math.round(total / remainingTasks.length);
      projectStatus =
        projectProgress === 100
          ? "completed"
          : projectProgress > 0
          ? "active"
          : "todo";
    }

    const { error: projectError } = await supabase
      .from("projects")
      .update({
        progress: projectProgress,
        status: projectStatus,
      })
      .eq("id", projectId);

    if (projectError) {
      console.error(projectError);
    }

    await logActivity({
      userId,
      userName,
      action: `deleted task ${taskTitle}`,
      projectId,
      projectName,
    });

    setLoading(false);
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        className="btn btn-danger"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        style={{
          padding: "8px 12px",
          fontSize: "12px",
          borderRadius: "10px",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDeleteModal
        open={confirmOpen}
        title={`Delete task ${taskTitle}`}
        description={`This will permanently remove the task from the project.`}
        confirmLabel="Delete task"
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      />
    </>
  );
}
