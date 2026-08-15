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

  if (error) throw error

  return (data || []).map((review) => ({
    ...review,
    createdAt: review.created_at,
  }))
}
