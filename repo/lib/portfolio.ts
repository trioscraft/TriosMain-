import { projects } from "@/lib/data";

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
