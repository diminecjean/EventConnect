import { connectToDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const userId = params.id;
    const db = await connectToDB();

    // Get time parameter for polling (optional)
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get("since");

    // Query filter
    const filter: any = { recipientId: userId };

    // If polling for new notifications, only get ones since last check
    if (since) {
      filter.createdAt = { $gt: new Date(since) };
    }

    console.log("Fetching notifications for user:", userId);

    // Get notifications for this user
    const notifications = await db
      .collection("notifications")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      notifications,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}
