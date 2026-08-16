import { NextResponse } from "next/server";
import { getAnalyticsData } from "@/lib/analytics";

export async function GET() {
  try {
    const analytics = await getAnalyticsData();
    return NextResponse.json(analytics, { status: 200 });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ message: "Unable to load analytics." }, { status: 500 });
  }
}
