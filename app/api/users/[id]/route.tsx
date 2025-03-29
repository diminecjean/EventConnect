import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET single user by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    console.log({params});
    
    const id = params.id;
    
    const db = await connectToDB();

    // Try to find by MongoDB ObjectId first, then by custom ID field
    let user = null;
    
    if (ObjectId.isValid(id)) {
      user = await db.collection("users").findOne({ 
        _id: new ObjectId(id) 
      });
    }
    
    // If not found by ObjectId, try by custom id field
    if (!user) {
      console.log("Checking for user by ObjectId:", id);
      user = await db.collection("users").findOne({ id: id });
    }
    
    // Return 404 if event not found
    if (!user) {
      console.log("User not found:", id);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log('User found:', {user});
    return NextResponse.json({
      status: "success",
      user
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}
