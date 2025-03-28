import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

// GET single organization by ID
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Organization ID is required" },
        { status: 400 }
      );
    }
    console.log({params});
    
    const id = params.id;
    
    const client = await connectToDB();
    const db = client.db();

    // Try to find by MongoDB ObjectId first, then by custom ID field
    let organization = null;
    
    if (ObjectId.isValid(id)) {
      organization = await db.collection("organizations").findOne({ 
        _id: new ObjectId(id) 
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
        { status: 404 }
      );
    }
    console.log('Organization found:', {organization});
    return NextResponse.json({
      status: "success",
      organization
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}
