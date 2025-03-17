import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET single event by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }
    console.log({params});
    
    const id = params.id;
    
    const client = await connectToDB();
    const db = client.db();

    // Try to find by MongoDB ObjectId first, then by custom ID field
    let event = null;
    
    if (ObjectId.isValid(id)) {
      event = await db.collection("events").findOne({ 
        _id: new ObjectId(id) 
      });
    }
    
    // If not found by ObjectId, try by custom id field
    if (!event) {
      console.log("Checking for event by ObjectId:", id);
      event = await db.collection("events").findOne({ id: id });
    }
    
    // Return 404 if event not found
    if (!event) {
      console.log("Event not found:", id);
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({
      status: "success",
      event
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
