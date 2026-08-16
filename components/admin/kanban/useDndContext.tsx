"use client";

import { createContext, useContext } from "react";
import type { KanbanTask } from "@/types/admin/kanban";

export type DndOverlayState = {
  active: { task: KanbanTask } | null;
  overlayStyle: object;
  portalNode: HTMLElement;
};

const DndContext = createContext<DndOverlayState | null>(null);

export function DndContextProvider({
  value,
  children,
}: {
  value: DndOverlayState;
  children: React.ReactNode;
}) {
  return <DndContext.Provider value={value}>{children}</DndContext.Provider>;
}

export function useDndContext() {
  const ctx = useContext(DndContext);
  if (!ctx) {
    throw new Error("useDndContext must be used within DndContextProvider");
  }
  return ctx;
}

