import { supabase } from "./supabase";

export async function getPublishedPortfolioProjects() {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load published portfolio projects:", error);
    return [];
  }
  return data || [];
}

export async function getFeaturedPortfolioProjects() {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load featured portfolio projects:", error);
    return [];
  }
  return data || [];
}

export async function getAllPortfolioProjects() {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load portfolio projects:", error);
    return [];
  }
  return data || [];
}

export async function addPortfolioProject(input) {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePortfolioProject(id, patch) {
  const { data, error } = await supabase
    .from("portfolio_projects")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePortfolioProject(id) {
  const { error } = await supabase
    .from("portfolio_projects")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
