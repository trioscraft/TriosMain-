import { NextResponse } from "next/server"
import { addReview, getApprovedReviews } from "@/lib/reviews"

export async function GET() {
  try {
    const reviews = getApprovedReviews()
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error("Failed to fetch reviews:", error)
    return NextResponse.json(
      { reviews: [], error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, company, rating, comment } = body

    if (!name || !comment) {
      return NextResponse.json(
        { error: "Name and comment are required" },
        { status: 400 }
      )
    }

    const review = addReview({
      name: String(name).trim(),
      company: company ? String(company).trim() : "",
      rating: Number(rating),
      comment: String(comment).trim(),
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("Failed to add review:", error)
    return NextResponse.json(
      { error: "Failed to add review" },
      { status: 500 }
    )
  }
}
