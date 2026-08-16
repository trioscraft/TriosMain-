"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3001/admin/reset-password",
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)", padding: 20 }}>
        <div style={{
          maxWidth: 440, width: "100%", padding: "48px 44px 40px",
          background: "rgba(14,20,32,0.82)", backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)", borderRadius: 28,
          border: "1px solid rgba(99,179,237,0.12)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,179,237,0.45), rgba(183,148,244,0.35), transparent)",
            backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite",
          }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, marginBottom: 16, color: "var(--text-primary)" }}>
            Check your email
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            We&apos;ve sent a password reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>. Click the link in the email to reset your password.
          </p>
          <button onClick={() => router.push("/admin/login")} style={{
            marginTop: 24, width: "100%", padding: "12px 24px",
            background: "linear-gradient(135deg, #63b3ed 0%, #4a9bd4 50%, #3a86c0 100%)",
            border: "none", borderRadius: 12, cursor: "pointer",
            color: "#051628", fontFamily: "var(--font-body)", fontSize: 14,
            fontWeight: 700,
          }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)", padding: 20 }}>
      <div style={{
        maxWidth: 440, width: "100%", padding: "48px 44px 40px",
        background: "rgba(14,20,32,0.82)", backdropFilter: "blur(28px) saturate(1.4)",
        WebkitBackdropFilter: "blur(28px) saturate(1.4)", borderRadius: 28,
        border: "1px solid rgba(99,179,237,0.12)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(99,179,237,0.45), rgba(183,148,244,0.35), transparent)",
          backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite",
        }} />
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, marginBottom: 8, color: "var(--text-primary)" }}>
          Forgot Password?
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--text-tertiary)", marginBottom: 8,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              style={{
                width: "100%", boxSizing: "border-box", padding: "13px 16px",
                background: "rgba(26,34,53,0.7)", border: "1px solid var(--border)",
                borderRadius: 12, color: "var(--text-primary)",
                fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            style={{
              marginTop: 6, width: "100%", padding: "14px 24px",
              background: loading
                ? "rgba(99,179,237,0.3)"
                : "linear-gradient(135deg, #63b3ed 0%, #4a9bd4 50%, #3a86c0 100%)",
              border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
              color: "#051628", fontFamily: "var(--font-body)", fontSize: 15,
              fontWeight: 700, opacity: !email && !loading ? 0.45 : 1,
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: "center", color: "var(--text-tertiary)", fontSize: 13 }}>
          Remember your password?{" "}
          <button onClick={() => router.push("/admin/login")} style={{
            background: "none", border: "none", color: "var(--accent)",
            cursor: "pointer", fontFamily: "var(--font-body)", textDecoration: "underline",
          }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
