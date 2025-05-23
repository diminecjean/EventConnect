import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const db = await connectToDB();
    const { badgeId, userId, eventId } = await request.json();

    // Validate required data
    if (!badgeId || !userId || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get badge details to check the type
    const badge = await db.collection("badges").findOne({
      _id: new ObjectId(badgeId),
    });

    if (!badge) {
      return NextResponse.json({ error: "Badge not found" }, { status: 404 });
    }

    // Check if user already claimed this badge
    const existingClaim = await db.collection("userBadges").findOne({
      badgeId: new ObjectId(badgeId),
      userId,
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "Badge already claimed" },
        { status: 409 },
      );
    }

    // Only check for check-in status if it's a participant badge
    const badgeType = (badge.badgeType || badge.type || "").toLowerCase();

    if (badgeType === "participant") {
      // Verify the user is registered and checked in for this event
      const registration = await db.collection("registrations").findOne({
        eventId,
        userId,
        checkedIn: true,
      });

      if (!registration) {
        return NextResponse.json(
          { error: "User not checked in for this event" },
          { status: 403 },
        );
      }
    }

    // For other badge types (speaker, sponsor, etc.), we skip the check-in validation
    // Could add specific validations for other badge types here if needed

    // Create badge claim
    const claim = {
      badgeId: new ObjectId(badgeId),
      userId,
      eventId,
      badgeType: badgeType, // Store the badge type for easier querying later
      claimedAt: new Date(),
    };

    const result = await db.collection("userBadges").insertOne(claim);

    if (!result.acknowledged) {
      throw new Error("Failed to claim badge");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Badge claimed successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error claiming badge:", error);
    return NextResponse.json(
      { error: "Failed to claim badge" },
      { status: 500 },
    );
  }
}
