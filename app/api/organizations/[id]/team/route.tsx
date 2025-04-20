import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _request: NextRequest,
  props: { params: { id: string } },
) {
  try {
    const params = props.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Find users who have this organization ID in their organizations array
    // Use inclusion projection only - specify exactly which fields you want
    const teamMembers = await db
      .collection("users")
      .find({ organizations: id })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        profilePicture: 1,
        bio: 1,
        joinDate: 1,
      })
      .toArray();

    return NextResponse.json({ teamMembers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members" },
      { status: 500 },
    );
  }
}
