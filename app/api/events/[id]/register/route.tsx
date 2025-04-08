// app/api/events/[id]/register/route.tsx
import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";

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
