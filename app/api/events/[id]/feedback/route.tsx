import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET: Fetch all feedback for an event
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await props.params;
    const db = await connectToDB();

    const feedback = await db
      .collection("feedback")
      .find({ eventId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch feedback" },
      { status: 500 },
    );
  }
}

// POST: Submit feedback for an event
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { id: eventId } = await props.params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const { rating, comment, anonymous } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Check if user is registered for this event
    const registration = await db.collection("registrations").findOne({
      eventId,
      userId,
    });

    if (!registration) {
      return NextResponse.json(
        { error: "You must be registered for this event to provide feedback" },
        { status: 403 },
      );
    }

    // Check if user already submitted feedback
    const existingFeedback = await db.collection("feedback").findOne({
      eventId,
      userId,
    });

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You have already submitted feedback for this event" },
        { status: 409 },
      );
    }

    const userData = await db.collection("users").findOne({
      _id: new ObjectId(userId),
    });

    // Create feedback document
    const feedbackDoc = {
      eventId,
      userId,
      userName: anonymous ? null : userData?.name || null,
      userEmail: anonymous ? null : userData?.email || null,
      userProfilePicture: anonymous ? null : userData?.profilePicture || null,
      rating,
      comment,
      anonymous: Boolean(anonymous),
      createdAt: new Date(),
    };

    await db.collection("feedback").insertOne(feedbackDoc);

    return NextResponse.json(
      { message: "Feedback submitted successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}
