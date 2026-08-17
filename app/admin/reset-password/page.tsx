"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthShell from "@/components/admin/AuthShell";
import Button from "@/components/admin/ui/Button";
import { Field, Input } from "@/components/admin/ui/Field";

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
        const { error } = await supabase.auth.setSession({ access_token, refresh_token });
        if (error) setError(error.message);
        else setHasSession(true);
      } else {
        const { data } = await supabase.auth.getSession();
        if (data.session) setHasSession(true);
        else setError("Invalid or expired reset link. Please try again.");
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
    setTimeout(() => router.push("/admin/login"), 2000);
  }

  if (checkingSession) {
    return (
      <AuthShell title="Verifying link…">
        <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "2px solid var(--accent-soft)",
              borderTopColor: "var(--accent)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </div>
      </AuthShell>
    );
  }

  if (!hasSession || success) {
    return (
      <AuthShell title={success ? "Password updated" : "Reset link invalid"}>
        <div className="empty-state" style={{ border: "none", background: "transparent", padding: "8px 0" }}>
          <div className="empty-state-icon" style={{ color: success ? "var(--green)" : "var(--red)" }}>
            {success ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            {success
              ? "Your password has been updated. Redirecting to login…"
              : error || "The reset link is invalid or has expired. Please request a new one."}
          </p>
        </div>
        {!success && (
          <Button variant="primary" size="lg" onClick={() => router.push("/admin/forgot-password")} style={{ marginTop: 20 }}>
            Try again
          </Button>
        )}
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set new password" subtitle="Choose a strong new password.">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="New password" htmlFor="password">
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <Input id="password" type="password" placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: 40 }} required minLength={6} />
          </div>
        </Field>

        <Field label="Confirm password" htmlFor="confirm">
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <Input
              id="confirm"
              type="password"
              placeholder="••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ paddingLeft: 40 }}
              required
              minLength={6}
            />
          </div>
        </Field>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--red)", fontSize: 13 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} disabled={!password || !confirmPassword} style={{ marginTop: 4 }}>
          {!loading && <ArrowRight size={16} />}
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
