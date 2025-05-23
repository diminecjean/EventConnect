import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// Check if user is checked in for an event
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string; attendeeId: string }> },
) {
  const params = await props.params;
  try {
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    const { id: eventId, attendeeId: userId } = params;

    const db = await connectToDB();

    const registration = await db.collection("registrations").findOne({
      eventId: eventId,
      userId: userId,
    });

    return NextResponse.json({
      registered: !!registration,
      checkedIn: registration?.checkedIn || false,
      checkedInTime: registration?.checkedInTime || null,
    });
  } catch (error) {
    console.error("Error checking attendance:", error);
    return NextResponse.json(
      { error: "Failed to check attendance" },
      { status: 500 },
    );
  }
}

// checkin attendee
// POST /api/events/:id/attendees/:attendeeId/checkin
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string; attendeeId: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    const { id: eventId, attendeeId } = params;

    // Connect to the database
    const db = await connectToDB();

    // Find the event to verify organization
    const event = await db.collection("events").findOne({
      _id: new ObjectId(eventId),
    });

    if (!event) {
      return NextResponse.json(
        { error: "[Checkin Attendee] Event not found" },
        { status: 404 },
      );
    }

    console.log("Checking in attendee for event:", { eventId, attendeeId });

    // Update the registration record to mark as checked in
    const result = await db.collection("registrations").updateOne(
      { eventId: eventId, userId: attendeeId },
      {
        $set: {
          checkedIn: true,
          checkedInTime: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    console.log("Checkin result:", result);

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Attendee checked in successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error checking in attendee:", error);
    return NextResponse.json(
      { error: error || "Failed to check in attendee" },
      { status: 500 },
    );
  }
}
