import { connectToDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  try {
    const client = await connectToDB();
    const db = client.db();

    const users = await db.collection("users").find({}).toArray();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const client = await connectToDB();
    const db = client.db();
    
    const body = await req.json();
    
    if (!body || !body.name || !body.email) {
      return NextResponse.json(
        { error: "Missing required user fields" },
        { status: 400 }
      );
    }
    
    const result = await db.collection("users").insertOne(body);
    
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