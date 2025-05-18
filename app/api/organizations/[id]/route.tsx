import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET single organization by ID
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    const id = params.id;

    const db = await connectToDB();

    // Try to find by MongoDB ObjectId first, then by custom ID field
    let organization = null;

    if (ObjectId.isValid(id)) {
      organization = await db.collection("organizations").findOne({
        _id: new ObjectId(id),
      });
    }

    // If not found by ObjectId, try by custom id field
    if (!organization) {
      console.log("Checking for organization by ObjectId:", id);
      organization = await db.collection("organizations").findOne({ id: id });
    }

    // Return 404 if event not found
    if (!organization) {
      console.log("Organization not found:", id);
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }
    // console.log("Organization found:", { organization });
    return NextResponse.json(
      {
        status: "success",
        organization,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 },
    );
  }
}

// PATCH/Update organization by ID
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 },
      );
    }

    const id = params.id;
    // Get update data from request body
    const updateData = await request.json();

    // Connect to database
    const db = await connectToDB();

    // Validate that the organization exists
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

    // Prepare update document - only include fields that are provided
    const updateDoc: Record<string, any> = {};

    // Whitelist fields that can be updated
    const allowedFields = [
      "name",
      "description",
      "location",
      "logo",
      "banner",
      "website",
      "contactEmail",
      "socialLinks",
    ];

    // Only add fields that are in the allowedFields list
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateDoc[field] = updateData[field];
      }
    }

    // Add updated timestamp
    updateDoc["updatedAt"] = new Date();

    // Update the organization
    const result = await db
      .collection("organizations")
      .updateOne({ _id: organization._id }, { $set: updateDoc });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    // Return the updated organization
    const updatedOrganization = await db.collection("organizations").findOne({
      _id: organization._id,
    });

    return NextResponse.json({
      status: "success",
      message: "Organization updated successfully",
      organization: updatedOrganization,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 },
    );
  }
}
