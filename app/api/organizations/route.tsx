import { connectToDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  try {
    const db = await connectToDB();

    const organizations = await db.collection("organizations").find({}).toArray();

    return NextResponse.json({ organizations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const db = await connectToDB();
    
    const body = await req.json();
    
    if (!body || !body.name || !body.email) {
      return NextResponse.json(
        { error: "Missing required user fields" },
        { status: 400 }
      );
    }
    
    const result = await db.collection("organizations").insertOne(body);
    
    return NextResponse.json(
      { message: "User added successfully", userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json(
      { error: "Failed to add user" },
      { status: 500 }
    );
  }
};