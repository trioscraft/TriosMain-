import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

let cache: { value: { active: boolean; scope: "client" | "member" | "both" } | null; ts: number } | null =
  null;
const CACHE_TTL = 5000;

type MaintenanceState = { active: boolean; scope: "client" | "member" | "both" } | null;

async function getMaintenance(): Promise<MaintenanceState> {
  const now = Date.now();
  if (cache && now - cache.ts < CACHE_TTL) return cache.value;
  try {
    const { data, error } = await supabaseAdmin
      .from("settings")
      .select("maintenance_mode, maintenance_scope, maintenance_ends_at, maintenance_reopen_at")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return cache?.value ?? null;

    const mode = Boolean(data.maintenance_mode);
    const reopenAt = data.maintenance_reopen_at
      ? new Date(data.maintenance_reopen_at).getTime()
      : null;
    const ended =
      data.maintenance_ends_at && new Date(data.maintenance_ends_at).getTime() <= now;
    // Block while actively in maintenance, OR during the post-stop "reopen"
    // cooldown window (reopen_at still in the future).
    const active = (mode || (reopenAt !== null && reopenAt > now)) && !ended;
    const scope = (data.maintenance_scope as "client" | "member" | "both") || "both";

    const value = { active, scope };
    cache = { value, ts: now };
    return value;
  } catch {
    return cache?.value ?? null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never block these paths.
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const m = await getMaintenance();
  if (m?.active) {
    const blockClient = m.scope === "client" || m.scope === "both";
    const blockMember = m.scope === "member" || m.scope === "both";

    const isClient = pathname.startsWith("/client");
    const isMember = pathname.startsWith("/member");

    if ((isClient && blockClient) || (isMember && blockMember)) {
      const target = isClient ? "client" : "member";
      const url = req.nextUrl.clone();
      url.pathname = "/maintenance";
      url.search = `?panel=${target}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|icon.svg|og-image.png).*)",
  ],
};
