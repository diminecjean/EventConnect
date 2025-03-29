import { connectToDB } from "../../../../lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Handle array directly since that's what's being sent
    const events = Array.isArray(body) ? body : body.events;

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "Invalid event data provided" },
        { status: 400 },
      );
    }

    console.log("Connecting to MongoDB...");
    const db = await connectToDB();
    console.log("Connected successfully");

    const collection = db.collection("events");

    // Clear existing events
    await collection.deleteMany({});

    console.log("Inserting events...");
    const result = await collection.insertMany(events);
    console.log("Events inserted successfully");

    return NextResponse.json(
      {
        success: true,
        count: result.insertedCount || events.length,
        message: "Database seeded successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error seeding database:", error);

    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: `Failed to seed database: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 },
    );
  }
}
