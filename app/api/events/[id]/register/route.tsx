// app/api/events/[id]/register/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { id: eventId } = await params;
    const registrationData = await request.json();

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
      eventId,
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
