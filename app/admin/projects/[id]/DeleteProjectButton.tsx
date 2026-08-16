"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logActivity } from "@/lib/activity";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";

type Props = {
  projectId: string;
  projectName: string;
};

export default function DeleteProjectButton({
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

    await supabase.from("activities").delete().eq("project_id", projectId);
    await supabase.from("time_entries").delete().eq("project_id", projectId);
    await supabase.from("tasks").delete().eq("project_id", projectId);

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    setLoading(false);
    setConfirmOpen(false);

    if (error) {
      alert(error.message);
      return;
    }

    await logActivity({
      userId,
      userName,
      action: `deleted project ${projectName}`,
      projectId,
      projectName,
    });

    router.push("/admin/projects");
  }

  return (
    <>
      <button
        className="btn btn-danger"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        style={{
          padding: "10px 16px",
          fontSize: "14px",
          borderRadius: "10px",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Deleting..." : "Delete project"}
      </button>

      <ConfirmDeleteModal
        open={confirmOpen}
        title={`Delete project ${projectName}`}
        description={`This will permanently remove the project, its tasks, related time entries, and older activities.`}
        confirmLabel="Delete project"
        onConfirm={onDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={loading}
      />
    </>
  );
}
