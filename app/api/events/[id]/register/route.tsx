import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
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

    const id = params.id;
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    console.log("Checking registration for user:", userId);

    const db = await connectToDB();

    // Check if user is already registered for this event
    const existingRegistration = await db.collection("registrations").findOne({
      eventId: id,
      userId,
    });

    console.log({ existingRegistration });

    return NextResponse.json({
      isRegistered: !!existingRegistration,
      registrationId: existingRegistration?._id || null,
    });
  } catch (error) {
    console.error("Error checking registration:", error);
    return NextResponse.json(
      { error: "Failed to check registration" },
      { status: 500 },
    );
  }
}

// Register a user for an event
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
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

    const id = params.id;
    const registrationData = await request.json();
    console.log("Registration data:", registrationData);

    // Validate required data
    if (!registrationData.userId || !registrationData.registrationFormId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Check if user already registered for this event
    const existingRegistration = await db.collection("registrations").findOne({
      eventId: id,
      userId: registrationData.userId,
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "User already registered for this event" },
        { status: 409 },
      );
    }

    // Create new registration
    const newRegistration = {
      ...registrationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db
      .collection("registrations")
      .insertOne(newRegistration);

    if (!result.acknowledged) {
      throw new Error("Failed to save registration");
    }

    // After registration, might want to:
    // 1. Update event attendance count
    // 2. Send confirmation email
    // 3. Create notification

    // After successfully registering for the event
    // Notify all connected friends
    const userId = registrationData.userId;
    const eventId = id;
    const acceptedConnections = await db
      .collection("connections")
      .find({
        $or: [
          { requesterId: userId, status: "ACCEPTED" },
          { recipientId: userId, status: "ACCEPTED" },
        ],
      })
      .toArray();

    if (acceptedConnections.length > 0) {
      const userData = await db.collection("users").findOne({
        _id: new ObjectId(userId),
      });

      const eventData = await db.collection("events").findOne({
        _id: new ObjectId(eventId),
      });

      if (userData && eventData) {
        // Create notifications for all connected friends
        const notifications = acceptedConnections.map((connection) => {
          // Determine which user ID is the friend (not the current user)
          const friendId =
            connection.requesterId === userId
              ? connection.recipientId
              : connection.requesterId;

          return {
            recipientId: friendId,
            type: "JOINED_EVENT",
            title: `${userData.name} Recently joined an event!`,
            content: `${userData.name} has registered for ${eventData.title}`,
            senderId: userId,
            eventId: eventId,
            isRead: false,
            createdAt: new Date(),
          };
        });

        // Insert notifications
        if (notifications.length > 0) {
          await db.collection("notifications").insertMany(notifications);
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        registrationId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error processing registration:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 },
    );
  }
}
