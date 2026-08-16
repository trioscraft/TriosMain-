"use client";

import { useEffect, useRef, useSyncExternalStore, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getCurrentUserRole } from "@/lib/getCurrentUserRole";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const W = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    W();
    window.addEventListener("resize", W);

    const count = 60;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.45 + 0.08,
    }));

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas!.width;
        if (p.x > canvas!.width) p.x = 0;
        if (p.y < 0) p.y = canvas!.height;
        if (p.y > canvas!.height) p.y = 0;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(216,167,92,${p.opacity})`;
        ctx!.fill();
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", W);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const role = await getCurrentUserRole();
      if (!isMounted) return;
      if (role) {
        router.replace(role === "admin" ? "/admin" : role === "member" ? "/admin/my-tasks" : "/admin/client");
        return;
      }
      setLoading(false);
    }
    void checkAuth();
    return () => { isMounted = false; };
  }, [router]);

  async function login() {
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) { alert(error.message); return; }
    const signedInEmail =
      data.user?.email?.trim().toLowerCase() ||
      data.session?.user?.email?.trim().toLowerCase() ||
      email.trim().toLowerCase();
    const signedInUserId = data.user?.id || data.session?.user?.id || undefined;
    const role = await getCurrentUserRole(signedInEmail, signedInUserId);
    if (!role) {
      alert("Login succeeded, but we could not determine your role. Please check that your Supabase profile or client user record has a valid role.");
      return;
    }
    router.replace(role === "admin" ? "/admin" : role === "member" ? "/admin/my-tasks" : "/admin/client");
  }

  const styles = `
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes orb1 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33%       { transform: translate(60px, -40px) scale(1.08); }
      66%       { transform: translate(-40px, 50px) scale(0.94); }
    }
    @keyframes orb2 {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50%       { transform: translate(-70px, 30px) scale(1.12); }
    }
    @keyframes logoFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-5px); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 rgba(216,167,92,0.4); }
      70%  { box-shadow: 0 0 0 10px transparent; }
      100% { box-shadow: 0 0 0 0 transparent; }
    }
    .login-card {
      animation: fadeSlideUp 0.7s cubic-bezier(0.22,1,0.36,1) both;
      animation-delay: 0.1s;
    }
    .login-field {
      animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
    }
    .login-field:nth-child(1) { animation-delay: 0.28s; }
    .login-field:nth-child(2) { animation-delay: 0.38s; }
    .login-btn {
      animation: fadeSlideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.48s both;
    }
    .login-footer {
      animation: fadeIn 0.6s ease 0.65s both;
    }
    .login-btn:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(216,167,92,0.35);
    }
    .login-btn:not(:disabled):active {
      transform: translateY(0) scale(0.98);
    }
    .login-input:hover { border-color: rgba(216,167,92,0.35) !important; }
  `;

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div style={{
          minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-base)", flexDirection: "column", gap: 16,
        }}>
          <div style={{
            width: 36, height: 36, border: "2px solid rgba(216,167,92,0.15)",
            borderTopColor: "#d8a75c", borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "var(--text-tertiary)", fontSize: 14, fontFamily: "var(--font-body)" }}>
            Checking authentication…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      {/* Full-page container */}
      <div style={{
        minHeight: "100vh", position: "relative", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "var(--bg-base)", overflow: "hidden", padding: "20px",
      }}>

        {/* Particle canvas */}
        <canvas ref={canvasRef} style={{
          position: "absolute", inset: 0, zIndex: 0, opacity: mounted ? 1 : 0,
          transition: "opacity 1.2s ease",
        }} />

        {/* Ambient orbs */}
        <div style={{
          position: "absolute", width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(216,167,92,0.07) 0%, transparent 70%)",
          top: "10%", left: "55%", transform: "translate(-50%,-50%)",
          animation: "orb1 14s ease-in-out infinite", zIndex: 0, pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(183,148,244,0.06) 0%, transparent 70%)",
          bottom: "5%", left: "15%",
          animation: "orb2 18s ease-in-out infinite", zIndex: 0, pointerEvents: "none",
        }} />

        {/* Diagonal grid lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.025, pointerEvents: "none" }}
          xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 64" stroke="#d8a75c" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Glass card */}
        <div className="login-card" style={{
          position: "relative", zIndex: 1,
          width: "100%", maxWidth: 440,
          background: "rgba(14,20,32,0.82)",
          backdropFilter: "blur(28px) saturate(1.4)",
          WebkitBackdropFilter: "blur(28px) saturate(1.4)",
          borderRadius: 28,
          border: "1px solid rgba(216,167,92,0.12)",
          boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(216,167,92,0.08) inset, 0 1px 0 rgba(255,255,255,0.05) inset",
          padding: "48px 44px 40px",
          overflow: "hidden",
        }}>

          {/* Top shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg, transparent, rgba(216,167,92,0.45), rgba(183,148,244,0.35), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s linear infinite",
          }} />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: 18,
              background: "linear-gradient(135deg, rgba(216,167,92,0.2) 0%, rgba(183,148,244,0.15) 100%)",
              border: "1px solid rgba(216,167,92,0.25)",
              marginBottom: 20, fontSize: 26,
              animation: "logoFloat 4s ease-in-out infinite",
              boxShadow: "0 8px 24px rgba(216,167,92,0.15), 0 0 0 0 rgba(216,167,92,0.3)",
            }}>
              ⬥
            </div>

            <div style={{ marginBottom: 6 }}>
              <span style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: 28, letterSpacing: "-0.04em",
                background: "linear-gradient(135deg, #fff 30%, rgba(216,167,92,0.85) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                TriosFlow
              </span>
            </div>

            <p style={{
              color: "var(--text-tertiary)", fontSize: 13,
              fontFamily: "var(--font-body)", letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Workflow OS · Sign in to continue
            </p>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", marginBottom: 28 }} />

          {/* Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Email field */}
            <div className="login-field">
              <label style={{
                display: "block", fontSize: 12, fontWeight: 500,
                color: emailFocused ? "var(--accent)" : "var(--text-tertiary)",
                marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase",
                transition: "color 0.2s ease",
              }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 16px 13px 42px",
                    background: "rgba(26,34,53,0.7)",
                    border: `1px solid ${emailFocused ? "rgba(216,167,92,0.5)" : "var(--border)"}`,
                    borderRadius: 12, color: "var(--text-primary)",
                    fontFamily: "var(--font-body)", fontSize: 14,
                    outline: "none", transition: "all 0.2s ease",
                    boxShadow: emailFocused ? "0 0 0 3px rgba(216,167,92,0.12)" : "none",
                  }}
                />
                <svg style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  opacity: emailFocused ? 0.9 : 0.4, transition: "opacity 0.2s ease",
                }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d8a75c" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
            </div>

            {/* Password field */}
            <div className="login-field">
              <label style={{
                display: "block", fontSize: 12, fontWeight: 500,
                color: passFocused ? "var(--accent)" : "var(--text-tertiary)",
                marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase",
                transition: "color 0.2s ease",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="login-input"
                  type="password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && login()}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    padding: "13px 16px 13px 42px",
                    background: "rgba(26,34,53,0.7)",
                    border: `1px solid ${passFocused ? "rgba(216,167,92,0.5)" : "var(--border)"}`,
                    borderRadius: 12, color: "var(--text-primary)",
                    fontFamily: "var(--font-body)", fontSize: 14,
                    outline: "none", transition: "all 0.2s ease",
                    boxShadow: passFocused ? "0 0 0 3px rgba(216,167,92,0.12)" : "none",
                  }}
                />
                <svg style={{
                  position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                  opacity: passFocused ? 0.9 : 0.4, transition: "opacity 0.2s ease",
                }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d8a75c" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            {/* Submit button */}
            <button
              className="login-btn"
              onClick={login}
              disabled={submitting || !email || !password}
              style={{
                marginTop: 6,
                width: "100%", padding: "14px 24px",
                background: submitting
                  ? "rgba(216,167,92,0.3)"
                  : "linear-gradient(135deg, #d8a75c 0%, #c68f47 50%, #b8823c 100%)",
                border: "none", borderRadius: 12, cursor: submitting ? "not-allowed" : "pointer",
                color: "#051628", fontFamily: "var(--font-body)", fontSize: 15,
                fontWeight: 700, letterSpacing: "0.01em",
                transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                opacity: (!email || !password) && !submitting ? 0.45 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                animation: "pulseRing 2.5s ease-in-out infinite",
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: 16, height: 16, border: "2px solid rgba(5,22,40,0.3)",
                    borderTopColor: "#051628", borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in to TriosFlow
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
            {/* Forgot password link */}
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button
                onClick={() => router.push("/admin/forgot-password")}
                style={{
                  background: "none", border: "none", color: "var(--accent)",
                  fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)",
                  textDecoration: "underline",
                }}
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="login-footer" style={{
            marginTop: 32, paddingTop: 24,
            borderTop: "1px solid var(--border)",
            textAlign: "center",
          }}>
            <p style={{ color: "var(--text-tertiary)", fontSize: 12, lineHeight: 1.6 }}>
              By signing in, you agree to TriosFlow&apos;s{" "}
              <span style={{ color: "var(--accent)", cursor: "pointer" }}>Terms of Service</span>
              {" "}and{" "}
              <span style={{ color: "var(--accent)", cursor: "pointer" }}>Privacy Policy</span>.
            </p>
          </div>

          {/* Bottom corner accent */}
          <div style={{
            position: "absolute", bottom: -60, right: -60,
            width: 160, height: 160, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(216,167,92,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
        </div>

        {/* Below card label */}
        <div style={{
          position: "absolute", bottom: 28, left: 0, right: 0,
          textAlign: "center", zIndex: 1,
          animation: "fadeIn 1s ease 0.9s both",
        }}>
          <p style={{
            color: "var(--text-tertiary)", fontSize: 12,
            fontFamily: "var(--font-body)", letterSpacing: "0.04em",
          }}>
            TriosFlow · Secure Workspace · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </>
  );
}