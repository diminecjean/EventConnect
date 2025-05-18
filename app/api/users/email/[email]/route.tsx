import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";

// GET single user by email
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ email: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an email
    if (!params || !params.email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 },
      );
    }

    const email = params.email;

    const db = await connectToDB();

    // Find user by email
    const user = await db.collection("users").findOne({ email: email });

    // Return 404 if user not found
    if (!user) {
      console.log("User not found:", email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User found:", { user });
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
