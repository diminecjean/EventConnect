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

// POST to add team members to an organization
// This is done by inserting the organization id to the respective user profiles.
export async function POST(
  request: NextRequest,
  props: { params: { id: string } },
) {
  try {
    const { id } = props.params;
    const body = await request.json();
    const { userIds } = body;

    if (!id || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Organization ID and user IDs are required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Check if organization exists
    const organization = await db
      .collection("organizations")
      .findOne({ _id: new ObjectId(id) });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Add organization to each user's organizations array
    const updateResults = await Promise.all(
      userIds.map(async (userId) => {
        try {
          const userObjectId = new ObjectId(userId);
          const result = await db.collection("users").updateOne(
            { _id: userObjectId },
            { $addToSet: { organizations: id } }, // Using addToSet to prevent duplicates
          );
          return {
            userId,
            success: result.matchedCount > 0,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
          };
        } catch (error) {
          console.error(`Error updating user ${userId}:`, error);
          return { userId, success: false, error: String(error) };
        }
      }),
    );

    const successCount = updateResults.filter((r) => r.success).length;

    return NextResponse.json(
      {
        message: `Added ${successCount} team member${successCount !== 1 ? "s" : ""} successfully`,
        results: updateResults,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error adding team members:", error);
    return NextResponse.json(
      { error: "Failed to add team members" },
      { status: 500 },
    );
  }
}
