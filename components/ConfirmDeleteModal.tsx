"use client";

import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import Button from "@/components/admin/ui/Button";

type ConfirmDeleteModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={() => !loading && onConfirm()} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--radius-md)",
            display: "grid",
            placeItems: "center",
            background: "var(--red-dim)",
            border: "1px solid rgba(189,86,70,0.28)",
            color: "var(--red)",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 14 }}>{description}</p>
        </div>
      </div>
    </Modal>
  );
}
