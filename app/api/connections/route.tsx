import { connectToDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Get all connections for a user (both as requester and recipient)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();
    const query: Record<string, any> = {
      $or: [{ requesterId: userId }, { recipientId: userId }],
    };

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const connections = await db
      .collection("connections")
      .find(query)
      .toArray();

    return NextResponse.json(
      {
        status: "success",
        connections,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching connections:", error);
    return NextResponse.json(
      { error: "Failed to fetch connections" },
      { status: 500 },
    );
  }
}

// Create a new connection request
export async function POST(request: NextRequest) {
  try {
    const { requesterId, recipientId } = await request.json();

    if (!requesterId || !recipientId) {
      return NextResponse.json(
        { error: "Both requester and recipient IDs are required" },
        { status: 400 },
      );
    }

    if (requesterId === recipientId) {
      return NextResponse.json(
        { error: "Cannot send a connection request to yourself" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Check if a connection already exists between these users
    const existingConnection = await db.collection("connections").findOne({
      $or: [
        { requesterId, recipientId },
        { requesterId: recipientId, recipientId: requesterId },
      ],
    });

    if (existingConnection) {
      return NextResponse.json(
        {
          error: "A connection already exists between these users",
          connectionStatus: existingConnection.status,
        },
        { status: 400 },
      );
    }

    // Create a new connection request
    const newConnection = {
      requesterId,
      recipientId,
      status: "PENDING",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("connections").insertOne(newConnection);

    // Create a notification for the recipient
    const requesterData = await db.collection("users").findOne({
      _id: new ObjectId(requesterId),
    });

    if (requesterData) {
      const notification = {
        recipientId,
        type: "FRIEND_REQUEST",
        title: "New Friend Request",
        content: `${requesterData.name} sent you a friend request`,
        senderId: requesterId,
        isRead: false,
        createdAt: new Date(),
      };

      await db.collection("notifications").insertOne(notification);
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Connection request sent successfully",
        connection: {
          ...newConnection,
          _id: result.insertedId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating connection request:", error);
    return NextResponse.json(
      { error: "Failed to send connection request" },
      { status: 500 },
    );
  }
}
