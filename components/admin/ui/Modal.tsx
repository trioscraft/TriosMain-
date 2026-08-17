import { ReactNode, useEffect } from "react";
import clsx from "clsx";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div
        className={clsx("modal", size === "sm" && "max-w-[400px]", size === "lg" && "max-w-[680px]")}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {title && (
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700 }}>{title}</h2>
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>{footer}</div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div>
        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 15 }}>{title}</div>
        {description && (
          <div style={{ fontSize: 13.5, color: "var(--text-secondary)", marginTop: 4, maxWidth: 360 }}>{description}</div>
        )}
      </div>
      {action}
    </div>
  );
}
