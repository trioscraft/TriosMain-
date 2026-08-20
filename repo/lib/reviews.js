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
  // select("*") already includes `reply` once the column exists in the DB
  // (see supabase/migrations/009_add_reply_to_reviews.sql). Safe no-op if
  // the migration hasn't been run yet — reply will simply be undefined.
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((review) => ({
    ...review,
    createdAt: review.created_at,
    reply: review.reply ?? null,
  }))
}
