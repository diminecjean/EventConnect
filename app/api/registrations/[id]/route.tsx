import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// Pass in event ID to get number of registrations
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const id = params.id;

    console.log({ eventId: id });

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    const db = await connectToDB();

    // Count documents in registrations collection matching the eventId
    const count = await db.collection("registrations").countDocuments({
      eventId: new ObjectId(id),
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
