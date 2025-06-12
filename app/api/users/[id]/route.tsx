import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET single user by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const id = params.id;

    const db = await connectToDB();

    // Try to find by MongoDB ObjectId first, then by custom ID field
    let user = null;

    if (ObjectId.isValid(id)) {
      user = await db.collection("users").findOne({
        _id: new ObjectId(id),
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
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        status: "success",
        user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }
    console.log("PATCH request for user ID:", params.id);

    const id = params.id;
    const body = await req.json();
    console.log("Request body:", body);

    // Only allow updating of editable fields
    const {
      name,
      bio,
      position,
      organization,
      profilePicture,
      interests,
      socialMedia,
    } = body;

    const db = await connectToDB();

    // First, verify the user exists and log how it's stored
    let existingUser = null;
    if (ObjectId.isValid(id)) {
      existingUser = await db
        .collection("users")
        .findOne({ _id: new ObjectId(id) });
      console.log(
        "User lookup by _id result:",
        existingUser ? "found" : "not found",
      );
    }

    if (!existingUser) {
      existingUser = await db.collection("users").findOne({ id: id });
      console.log(
        "User lookup by id field result:",
        existingUser ? "found" : "not found",
      );
    }

    if (!existingUser) {
      console.log("User not found with either ID format");
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // User exists, now update it with proper ID type
    const updateQuery =
      existingUser._id instanceof ObjectId || ObjectId.isValid(existingUser._id)
        ? { _id: new ObjectId(existingUser._id.toString()) }
        : { id: existingUser.id };

    console.log("Using update query:", updateQuery);

    const result = await db.collection("users").findOneAndUpdate(
      updateQuery,
      {
        $set: {
          name,
          bio,
          organization,
          position,
          profilePicture,
          interests,
          socialMedia,
          updatedAt: new Date(),
        },
      },
      {
        returnDocument: "after",
        // Make sure the options are compatible with your MongoDB version
      },
    );

    console.log("Update result:", result);

    // Handle result format variations (MongoDB driver versions can return different structures)
    const updatedUser = result?.value || result || null;

    if (!updatedUser) {
      console.log("Update operation did not return a user");
      return NextResponse.json(
        { message: "User not found or update failed" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update user" },
      { status: 500 },
    );
  }
}
