import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const term = searchParams.get("term");

    if (!term || term.length < 2) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const db = await connectToDB();

    // Search users by name or email with case-insensitive search
    const users = await db
      .collection("users")
      .find({
        $or: [
          { name: { $regex: term, $options: "i" } },
          { email: { $regex: term, $options: "i" } },
        ],
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        profilePicture: 1,
        organizations: 1,
        organization: 1,
        position: 1,
      })
      .limit(10) // Limit results for performance
      .toArray();

    console.log({ users });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 },
    );
  }
}
