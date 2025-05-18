import { connectToDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// Get a specific connection
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const connectionId = params.id;

    const db = await connectToDB();
    const connection = await db
      .collection("connections")
      .findOne({ _id: new ObjectId(connectionId) });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        connection,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching connection:", error);
    return NextResponse.json(
      { error: "Failed to fetch connection" },
      { status: 500 },
    );
  }
}

// Update a connection (accept/reject/block)
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const connectionId = params.id;
    const { status, userId } = await request.json();

    if (!["ACCEPTED", "REJECTED", "BLOCKED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Find the connection first to verify it exists and check permissions
    const connection = await db
      .collection("connections")
      .findOne({ _id: new ObjectId(connectionId) });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    // Make sure the user is part of this connection
    if (
      connection.recipientId !== userId &&
      connection.requesterId !== userId
    ) {
      return NextResponse.json(
        { error: "Not authorized to update this connection" },
        { status: 403 },
      );
    }

    // Update the connection status
    const updatedConnection = await db
      .collection("connections")
      .findOneAndUpdate(
        { _id: new ObjectId(connectionId) },
        {
          $set: {
            status: status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" },
      );

    // If the connection was accepted, create a notification for the requester
    if (status === "ACCEPTED") {
      const recipientData = await db.collection("users").findOne({
        _id: new ObjectId(connection.recipientId),
      });

      if (recipientData) {
        const notification = {
          recipientId: connection.requesterId,
          type: "FRIEND_REQUEST",
          title: "Friend Request Accepted",
          content: `${recipientData.name} accepted your friend request`,
          senderId: connection.recipientId,
          isRead: false,
          createdAt: new Date(),
        };

        await db.collection("notifications").insertOne(notification);
      }
    }

    return NextResponse.json(
      {
        status: "success",
        message: `Connection ${status.toLowerCase()} successfully`,
        connection: updatedConnection?.value,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating connection:", error);
    return NextResponse.json(
      { error: "Failed to update connection" },
      { status: 500 },
    );
  }
}

// Delete a connection
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const connectionId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Find the connection first to verify it exists and check permissions
    const connection = await db
      .collection("connections")
      .findOne({ _id: new ObjectId(connectionId) });

    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 },
      );
    }

    // Make sure the user is part of this connection
    if (
      connection.recipientId !== userId &&
      connection.requesterId !== userId
    ) {
      return NextResponse.json(
        { error: "Not authorized to delete this connection" },
        { status: 403 },
      );
    }

    // Delete the connection
    await db
      .collection("connections")
      .deleteOne({ _id: new ObjectId(connectionId) });

    return NextResponse.json(
      {
        status: "success",
        message: "Connection removed successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting connection:", error);
    return NextResponse.json(
      { error: "Failed to remove connection" },
      { status: 500 },
    );
  }
}
