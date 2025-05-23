import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// Get all badges or filtered badges
export async function GET(request: NextRequest) {
  try {
    const db = await connectToDB();
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get("eventId");
    const userId = searchParams.get("userId");

    const query: any = {};

    if (eventId) {
      query.eventId = eventId;
    }

    const badges = await db.collection("badges").find(query).toArray();

    // If userId is provided, check which badges the user has claimed
    if (userId) {
      const userBadges = await db
        .collection("userBadges")
        .find({
          userId: userId,
        })
        .toArray();

      const userBadgeIds = userBadges.map((ub) => ub.badgeId.toString());

      // Add a "claimed" property to each badge
      badges.forEach((badge) => {
        badge.claimed = userBadgeIds.includes(badge._id.toString());
      });
    }

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 },
    );
  }
}

// Create a new badge
export async function POST(request: NextRequest) {
  try {
    const db = await connectToDB();
    const badgeData = await request.json();

    // Validate required fields
    if (!badgeData.name || !badgeData.eventId || !badgeData.organizationId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create badge
    const newBadge = {
      ...badgeData,
      createdAt: new Date(),
    };

    const result = await db.collection("badges").insertOne(newBadge);

    if (!result.acknowledged) {
      throw new Error("Failed to create badge");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Badge created successfully",
        badgeId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating badge:", error);
    return NextResponse.json(
      { error: "Failed to create badge" },
      { status: 500 },
    );
  }
}
