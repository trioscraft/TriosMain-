"use client";

import { useState } from "react";
import EditProjectModal, { ProjectData } from "@/components/EditProjectModal";
import DeleteProjectButton from "@/app/admin/projects/[id]/DeleteProjectButton";

export default function ProjectHeaderActions({
  project,
}: {
  project: ProjectData;
}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
      <button
        className="btn"
        onClick={() => setIsEditing(true)}
        style={{ padding: "10px 16px", fontSize: "14px" }}
      >
        Edit project
      </button>

      <DeleteProjectButton projectId={project.id} projectName={project.name} />

      <EditProjectModal
        open={isEditing}
        project={project}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
