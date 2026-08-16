"use client";

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
  if (!open) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
          padding: "28px",
        }}
      >
        <div
          style={{
            marginBottom: "18px",
            fontFamily: "var(--font-display)",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          {title}
        </div>
        <p
          style={{
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            marginBottom: "24px",
          }}
        >
          {description}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              color: "var(--text-secondary)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            onClick={async () => {
              if (!loading) {
                await onConfirm();
              }
            }}
            style={{
              flex: 1,
              padding: "12px 16px",
              borderRadius: "12px",
              border: "none",
              background: "var(--red)",
              color: "white",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
