"use client";

import { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useDndContext } from "@/components/admin/kanban/useDndContext";
import TaskCard from "@/components/admin/kanban/TaskCard";

export default function DragOverlay() {
  const { active, overlayStyle, portalNode } = useDndContext();

  if (!active || !portalNode) return null;

  return createPortal(
    <div style={overlayStyle as CSSProperties}>
      <TaskCard task={active.task} compact />
    </div>,
    portalNode
  );
}


