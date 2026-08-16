"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    async function checkSession() {
      let access_token: string | null = null;
      let refresh_token: string | null = null;

      if (typeof window !== "undefined") {
        const hash = window.location.hash;
        const query = window.location.search;

        if (hash) {
          const params = new URLSearchParams(hash.substring(1));
          access_token = params.get("access_token");
          refresh_token = params.get("refresh_token");
        }

        if (!access_token && query) {
          const params = new URLSearchParams(query);
          access_token = params.get("access_token");
          refresh_token = params.get("refresh_token");
        }
      }

      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          setError(error.message);
        } else {
          setHasSession(true);
        }
      } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setHasSession(true);
        } else {
          setError("Invalid or expired reset link. Please try again.");
        }
      }

      setCheckingSession(false);
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/login");
    }, 2000);
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)", padding: 20 }}>
        <div style={{
          maxWidth: 440, width: "100%", padding: "48px 44px 40px",
          background: "rgba(14,20,32,0.82)", borderRadius: 28,
          border: "1px solid rgba(99,179,237,0.12)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
          textAlign: "center",
        }}>
          <div style={{
            width: 36, height: 36, border: "2px solid rgba(99,179,237,0.15)",
            borderTopColor: "#63b3ed", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Verifying reset link…</p>
        </div>
      </div>
    );
  }

  if (!hasSession || success) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-base)", padding: 20 }}>
        <div style={{
          maxWidth: 440, width: "100%", padding: "48px 44px 40px",
          background: "rgba(14,20,32,0.82)", borderRadius: 28,
          border: "1px solid rgba(99,179,237,0.12)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(99,179,237,0.45), rgba(183,148,244,0.35), transparent)",
            backgroundSize: "200% 100%", animation: "shimmer 3s linear infinite",
          }} />
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, marginBottom: 16, color: "var(--text-primary)" }}>
            {success ? "Password Updated!" : "Reset Link Invalid"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            {success
              ? "Your password has been updated successfully. Redirecting to login…"
              : error || "The reset link is invalid or has expired. Please try again."}
          </p>
          {!success && (
            <button onClick={() => router.push("/admin/forgot-password")} style={{
              marginTop: 24, width: "100%", padding: "12px 24px",
              background: "linear-gradient(135deg, #63b3ed 0%, #4a9bd4 50%, #3a86c0 100%)",
              border: "none", borderRadius: 12, cursor: "pointer",
              color: "#051628", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700,
            }}>
              Try Again
            </button>
          )}
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
          Set New Password
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--text-tertiary)", marginBottom: 8,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
              minLength={6}
              style={{
                width: "100%", boxSizing: "border-box", padding: "13px 16px",
                background: "rgba(26,34,53,0.7)", border: "1px solid var(--border)",
                borderRadius: 12, color: "var(--text-primary)",
                fontFamily: "var(--font-body)", fontSize: 14, outline: "none",
                transition: "all 0.2s ease",
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 500,
              color: "var(--text-tertiary)", marginBottom: 8,
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••"
              required
              minLength={6}
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
            disabled={loading || !password || !confirmPassword}
            style={{
              marginTop: 6, width: "100%", padding: "14px 24px",
              background: loading
                ? "rgba(99,179,237,0.3)"
                : "linear-gradient(135deg, #63b3ed 0%, #4a9bd4 50%, #3a86c0 100%)",
              border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer",
              color: "#051628", fontFamily: "var(--font-body)", fontSize: 15,
              fontWeight: 700, opacity: (!password || !confirmPassword) && !loading ? 0.45 : 1,
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
