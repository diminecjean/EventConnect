import { connectToDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const notificationId = params.id;
    const db = await connectToDB();

    await db
      .collection("notifications")
      .updateOne(
        { _id: new ObjectId(notificationId) },
        { $set: { isRead: true } },
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
