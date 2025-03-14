import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDB } from "../../../lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const { db: dbConnection } = await connectToDB();
    const db = dbConnection();
    
    // Get the ID from the URL path
    const path = request.nextUrl.pathname;
    const id = path.split('/').pop();
    
    if (!id) {
      return NextResponse.json({ message: "ID not provided" }, { status: 400 });
    }

    // Check if the id is a valid ObjectId
    let query = {};
    if (ObjectId.isValid(id)) {
      query = { _id: new ObjectId(id) };
    } else {
      query = { id: id }; // Fallback to a string id if not an ObjectId
    }

    const event = await db.collection("events").findOne(query);

    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}