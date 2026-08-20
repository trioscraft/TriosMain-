"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <button
      onClick={logout}
      className="btn"
      style={{
        width: "100%",
        background: "var(--red-dim)",
        border: "1px solid rgba(189,86,70,0.28)",
        color: "var(--red)",
        fontWeight: 600,
      }}
    >
      <LogOut size={16} />
      Logout
    </button>
  );
}
