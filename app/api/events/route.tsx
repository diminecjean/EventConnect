import { connectToDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  try {
    const db = await connectToDB();

    const events = await db.collection("events").find({}).toArray();

    return NextResponse.json({ events }, { status: 200 });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 },
    );
  }
};
