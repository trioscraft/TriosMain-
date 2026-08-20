import { supabase } from "./supabase"

export async function addReview(review) {
  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        name: review.name,
        company: review.company || "",
        rating: Number(review.rating) || 5,
        comment: review.comment,
        approved: true,
      },
    ])
    .select()
    .single()

  if (error) throw error

  return {
    ...data,
    createdAt: data?.created_at || new Date().toISOString(),
  }
}

export async function getApprovedReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load approved reviews:", error)
    return []
  }

  return (data || []).map((review) => ({
    ...review,
    createdAt: review.created_at,
  }))
}

export async function getAllReviews() {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Failed to load reviews:", error)
    return []
  }

  return (data || []).map((review) => ({
    ...review,
    createdAt: review.created_at,
  }))
}

export async function updateReview(id, patch) {
  const { data, error } = await supabase
    .from("reviews")
    .update(patch)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  return {
    ...data,
    createdAt: data?.created_at || null,
  }
}

export async function deleteReview(id) {
  const { error } = await supabase.from("reviews").delete().eq("id", id)
  if (error) throw error
}
