import { connectToDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { Db, ObjectId } from "mongodb";
import { formatSingleDate } from "@/app/utils/formatDate";

// GET - Fetch events with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query: Record<string, any> = {};

    // Add filters based on search parameters
    if (searchParams.has("organizationId")) {
      query["organizationId"] = searchParams.get("organizationId");
    }

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

    // Create event first
    const newEvent = { ...eventData };
    const result = await db.collection("events").insertOne(newEvent);

    if (!result.acknowledged) {
      throw new Error("Failed to insert event");
    }

    const createdEvent = {
      ...newEvent,
      _id: result.insertedId,
    };

    // Handle additional operations asynchronously
    const eventId = result.insertedId.toString();

    // Start both operations in parallel
    Promise.all([
      createEventBadge(db, eventData, eventId),
      createEventNotifications(db, eventData, result.insertedId),
    ]).catch((error) => {
      console.error("Error in post-event operations:", error);
      // These operations are not critical for event creation success
    });

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

// Helper functions
async function createEventBadge(db: Db, eventData: any, eventId: string) {
  try {
    const formattedStartDate = formatSingleDate(eventData.startDate);

    const badgeData = {
      name: `${eventData.title} Participant`,
      description: `Participated in ${eventData.title}, which took place on ${formattedStartDate} at ${eventData.location}.}`,
      type: "PARTICIPANT",
      imageUrl: eventData.coverImageUrl || null,
      organizationId: eventData.organizationId,
      eventId: eventId,
      createdAt: new Date(),
    };

    await db.collection("badges").insertOne(badgeData);
    return true;
  } catch (error) {
    console.error("Failed to create default badge:", error);
    return false;
  }
}

async function createEventNotifications(
  db: Db,
  eventData: any,
  eventId: ObjectId,
) {
  try {
    // Find all subscribers in one query
    const subscribers = await db
      .collection("subscriptions")
      .find({ organizationId: eventData.organizationId })
      .toArray();

    if (subscribers.length === 0) {
      return false;
    }

    // Get organization data
    const orgData = await db.collection("organizations").findOne({
      _id: new ObjectId(eventData.organizationId),
    });

    if (!orgData) {
      return false;
    }

    // Create notifications for subscribers
    const notifications = subscribers.map((subscription) => ({
      recipientId: subscription.userId,
      type: "NEW_EVENT",
      title: `New Event by ${orgData.name}`,
      content: `${orgData.name} posted a new event: ${eventData.title}`,
      eventId: eventId,
      senderId: eventData.organizationId,
      isRead: false,
      createdAt: new Date(),
    }));

    if (notifications.length > 0) {
      await db.collection("notifications").insertMany(notifications);
    }

    return true;
  } catch (error) {
    console.error("Failed to create notifications:", error);
    return false;
  }
}
