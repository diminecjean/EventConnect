import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Find organization by MongoDB ObjectId or custom ID
    let organization = null;

    if (ObjectId.isValid(id)) {
      organization = await db.collection("organizations").findOne({
        _id: new ObjectId(id),
      });
    }

    if (!organization) {
      organization = await db.collection("organizations").findOne({ id: id });
    }

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Return pictures array or empty array if not found
    const pictures = organization.organizationPictures || [];

    return NextResponse.json({ pictures }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization pictures:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization pictures" },
      { status: 500 },
    );
  }
}

// POST to add pictures to an organization
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { imageUrl, caption } = body;

    if (!id || !imageUrl) {
      return NextResponse.json(
        { error: "Organization ID and image URL are required" },
        { status: 400 },
      );
    }

    const db = await connectToDB();

    // Find organization by MongoDB ObjectId or custom ID
    let organization = null;
    let orgId = null;

    if (ObjectId.isValid(id)) {
      organization = await db.collection("organizations").findOne({
        _id: new ObjectId(id),
      });
      orgId = new ObjectId(id);
    }

    if (!organization) {
      organization = await db.collection("organizations").findOne({ id: id });
      orgId = organization?._id;
    }

    if (!organization || !orgId) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Create new picture object with unique ID
    const newPicture = {
      _id: new ObjectId().toString(), // Convert to string for easier handling
      imageUrl,
      caption: caption || "",
      createdAt: new Date(),
    };

    const organizationObjectId = new ObjectId(orgId);

    // Update organization by adding new picture to organizationPictures array
    const result = await db.collection("organizations").updateOne(
      { _id: organizationObjectId },
      {
        $push: {
          organizationPictures: newPicture,
        } as any,
        $set: {
          updatedAt: new Date(),
        },
      },
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to add picture to organization" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Picture added successfully",
        picture: newPicture,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error adding organization picture:", error);
    return NextResponse.json(
      { error: "Failed to add organization picture" },
      { status: 500 },
    );
  }
}
