import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx("input", className)} {...props} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={clsx("input", className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ position: "relative" }}>
      <select className={clsx("input", className)} {...props}>
        {children}
      </select>
      <span
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
          color: "var(--text-tertiary)",
          fontSize: 12,
        }}
      >
        ▾
      </span>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span style={{ color: "var(--red)" }}> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="field-error">⚠ {error}</span>
      ) : hint ? (
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{hint}</span>
      ) : null}
    </div>
  );
}
