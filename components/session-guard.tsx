"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Each sign-in lasts exactly 24 hours. When the window expires the user is
// signed out and sent back to /login, no matter which page they are on.
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const START_KEY = "trios_session_start";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function enforce() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      let start = Number(localStorage.getItem(START_KEY) || 0);
      if (!start || Number.isNaN(start)) {
        start = Date.now();
        localStorage.setItem(START_KEY, String(start));
      }

      const elapsed = Date.now() - start;
      if (elapsed >= SESSION_DURATION_MS) {
        localStorage.removeItem(START_KEY);
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      // Schedule the logout exactly at the 24-hour mark (slight buffer).
      const remaining = SESSION_DURATION_MS - elapsed;
      timer = setTimeout(() => void enforce(), remaining + 1000);
    }

    // Reset the 24h clock on every fresh sign-in (not on token refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        localStorage.setItem(START_KEY, String(Date.now()));
      }
    });

    void enforce();

    return () => {
      if (timer) clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [router]);

  return children;
}