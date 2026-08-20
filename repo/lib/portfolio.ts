import { projects } from "@/lib/data";
import { supabaseAdmin, serviceRoleConfigured } from "@/lib/supabaseAdmin";

export type PortfolioProject = {
  id: string | number;
  title: string;
  tagline?: string;
  description?: string;
  image?: string;
  video_url?: string;
  category?: string;
  tech?: string[];
  // Legacy field names (still supported by ProjectCard as a fallback)
  demo?: string;
  github?: string;
  // Preferred field names
  demo_url?: string;
  github_url?: string;
  featured?: boolean;
};

/**
 * Returns the featured portfolio projects for the marketing homepage.
 * Currently backed by the static `projects` list in lib/data.js. Swap the
 * body of this function for a Supabase query (e.g. a `portfolio_projects`
 * table) later without touching any calling pages.
 */
export async function getFeaturedPortfolioProjects(): Promise<PortfolioProject[]> {
  return (projects as PortfolioProject[]).filter((p) => p.featured);
}

export async function getAllPortfolioProjects(): Promise<PortfolioProject[]> {
  return projects as PortfolioProject[];
}

/**
 * All projects meant for public display on the /projects page (i.e. not
 * drafts). Currently returns everything in the static list; swap for a
 * `.eq("published", true)` Supabase query later.
 */
export async function getPublishedPortfolioProjects(): Promise<PortfolioProject[]> {
  return projects as PortfolioProject[];
}

export type PublicStats = {
  projects: number;
  clients: number;
};

/**
 * Live counts for the homepage stats strip. Uses the service-role client so
 * RLS (which hides rows from the anon role) doesn't return 0. Falls back to
 * 0s if the service-role key isn't configured.
 */
export async function getPublicStats(): Promise<PublicStats> {
  if (!serviceRoleConfigured) {
    return { projects: 0, clients: 0 };
  }

  const [{ count: projectCount }, { count: clientCount }] = await Promise.all([
    supabaseAdmin.from("projects").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("clients").select("*", { count: "exact", head: true }),
  ]);

  return { projects: projectCount ?? 0, clients: clientCount ?? 0 };
}
