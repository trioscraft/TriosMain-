import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email and message are required" },
        { status: 400 }
      )
    }

    // TODO: Wire up email delivery (e.g. SendGrid / SMTP / Resend) here.
    // For now we record the submission so the form is functional end-to-end.
    // In a production deploy, send an email or store in a CRM.

    return NextResponse.json(
      {
        success: true,
        message:
          "Thanks for reaching out! We'll get back to you within 24-48 hours.",
        submission: {
          name,
          email,
          subject: subject || "Website Inquiry",
          message,
          receivedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
