import { connectToDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, any> = {};

    // Add filters based on search parameters
    // Example: ?category=conference&organizationId=12345
    // if (searchParams.has("category")) {
    //   query["category"] = searchParams.get("category");
    // }

    if (searchParams.has("organizationId")) {
      query["organizationId"] = searchParams.get("organizationId");
    }

    // Handle searching within the partnerOrganizations array
    if (searchParams.has("partnerOrganizations")) {
      const partnerId = searchParams.get("partnerOrganizations");
      query["partnerOrganizations"] = { $in: [partnerId] };
    }

    const db = await connectToDB();
    const events = await db
      .collection("events")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      {
        status: "success",
        count: events.length,
        events,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
}

// POST - Create a new event
export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    // Validate required fields
    if (!eventData.title) {
      return NextResponse.json(
        { error: "Event title is required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Prepare event document with required fields
    const newEvent = {
      ...eventData,
    };

    const result = await db.collection("events").insertOne(newEvent);

    if (!result.acknowledged) {
      throw new Error("Failed to insert event");
    }

    // Return the newly created event with MongoDB's _id
    const createdEvent = {
      ...newEvent,
      _id: result.insertedId,
    };

    return NextResponse.json(
      {
        status: "success",
        message: "Event created successfully",
        event: createdEvent,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 },
    );
  }
}
