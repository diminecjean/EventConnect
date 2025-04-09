import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId || !ObjectId.isValid(eventId)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const db = await connectToDB();

    // Count documents in registrations collection matching the eventId
    const count = await db.collection("registrations").countDocuments({
      eventId: eventId,
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Error fetching registration count:", error);
    return NextResponse.json(
      { error: "Failed to fetch registration count" },
      { status: 500 },
    );
  }
}
