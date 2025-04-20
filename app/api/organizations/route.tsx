import { ObjectId } from "mongodb";
import { connectToDB } from "../../lib/mongodb";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export const GET = async (_req: NextRequest) => {
  try {
    const db = await connectToDB();

    const organizations = await db
      .collection("organizations")
      .find({})
      .toArray();

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

    // Validate required fields for organization creation
    if (!body || !body.name || !body.userId) {
      return NextResponse.json(
        { error: "Missing required organization fields: name and userId" },
        { status: 400 },
      );
    }

    // Check if organization with this name already exists
    const existingOrganization = await db
      .collection("organizations")
      .findOne({ name: body.name });

    if (existingOrganization) {
      return NextResponse.json(
        { error: "Organization with this name already exists" },
        { status: 409 }, // 409 Conflict is appropriate for duplicate resources
      );
    }

    // Create organization document
    const organization = {
      name: body.name,
      description: body.description || "",
      location: body.location || "",
      logo: body.logo || null,
      banner: body.banner || null,
      website: body.website || "",
      contactEmail: body.contactEmail || "",
      socialLinks: body.socialLinks || {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
      ownerId: body.userId, // Add owner information directly
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("organizations").insertOne(organization);
    console.log("Insert result:", result);

    // Also add this organization to the user's organizations array
    // This whole complicated block is needed in order to successfully update the user
    if (result.acknowledged) {
      console.log("Organization created associated with userId:", body.userId);
      try {
        // Check if userId is a valid ObjectId
        const userObjectId = new ObjectId(body.userId);
        const insertOrgIdInUser = await db
          .collection("users")
          .updateOne(
            { _id: userObjectId },
            { $push: { organizations: result.insertedId.toString() as any } },
          );
        console.log({ insertOrgIdInUser });

        if (insertOrgIdInUser.matchedCount === 0) {
          console.error("User not found with ID:", body.userId);
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 },
          );
        }
      } catch (error) {
        console.error(
          "Invalid ObjectId format for userId:",
          body.userId,
          error,
        );
        return NextResponse.json(
          { error: "Invalid user ID format" },
          { status: 400 },
        );
      }
    } else {
      return NextResponse.json(
        {
          error: "Failed to insert orgId to user profile",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Organization created successfully",
        id: result.insertedId,
        organization: { ...organization, _id: result.insertedId },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 },
    );
  }
};
