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