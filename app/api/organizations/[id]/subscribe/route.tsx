import { connectToDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { SubscriberDetails } from "@/app/typings/subscriptions/typings";
import { sub } from "date-fns";

// Subscribe to an organization
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const organizationId = params.id;
    const { userId } = await request.json();

    const db = await connectToDB();

    console.log({ organizationId, userId });

    // Create subscription in the dedicated subscriptions collection
    // Using upsert to prevent duplicates
    const result = await db.collection("subscriptions").updateOne(
      {
        organizationId: organizationId,
        userId: userId,
      },
      {
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );

    // Check if a new document was inserted
    const isNewSubscription = result.upsertedCount === 1;

    console.log({ isNewSubscription, result });

    return NextResponse.json({
      success: true,
      isNewSubscription,
    });
  } catch (error) {
    console.error("Error subscribing to organization:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to organization" },
      { status: 500 },
    );
  }
}

// Unsubscribe from an organization
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const organizationId = params.id;
    const { userId } = await request.json();

    const db = await connectToDB();

    // Delete from the subscriptions collection
    const result = await db.collection("subscriptions").deleteOne({
      organizationId: new ObjectId(organizationId),
      userId: new ObjectId(userId),
    });

    // Check if a document was actually deleted
    const wasSubscribed = result.deletedCount === 1;

    return NextResponse.json({
      success: true,
      wasSubscribed,
    });
  } catch (error) {
    console.error("Error unsubscribing from organization:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from organization" },
      { status: 500 },
    );
  }
}

// Get all subscribers for an organization
// To get only the count, do:
//   GET /api/organizations/{organizationId}/subscribe?countOnly=true
// To get the list of subscribers, do:
//   GET /api/organizations/{organizationId}/subscribe?page=1&limit=20
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const organizationId = params.id;
    const db = await connectToDB();

    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const skip = (page - 1) * limit;
    const countOnly = url.searchParams.get("countOnly") === "true";

    console.log({ organizationId, limit, page, skip, countOnly });

    // If only count is needed, return just the count
    if (countOnly) {
      const count = await db
        .collection("subscriptions")
        .aggregate([
          { $match: { organizationId: organizationId } },
          { $group: { _id: "$userId" } },
          { $count: "uniqueSubscribers" },
        ])
        .toArray()
        .then((result) => result[0]?.uniqueSubscribers || 0);

      console.log("Subscriber count:", count);

      return NextResponse.json({
        success: true,
        subscriberCount: count,
      });
    }

    // Otherwise, fetch the subscribers with pagination
    const subscriptions = await db
      .collection("subscriptions")
      .find({ organizationId: organizationId })
      .sort({ createdAt: -1 }) // Sort by most recent first
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get the total count for pagination info
    const totalSubscribers = await db
      .collection("subscriptions")
      .countDocuments({
        organizationId: organizationId,
      });

    // Fetch user details for each subscriber
    // Using $in operator for better performance
    const userIds = subscriptions.map((sub) => new ObjectId(sub.userId));

    let subscriberDetails: SubscriberDetails[] = [];
    if (userIds.length > 0) {
      subscriberDetails = (await db
        .collection("users")
        .find({ _id: { $in: userIds } })
        .project({
          _id: 1,
          name: 1,
          email: 1,
          profilePicture: 1,
        })
        .toArray()) as unknown as SubscriberDetails[];

      // Map subscription dates to user details
      subscriberDetails = subscriberDetails.map((user) => {
        const subscription = subscriptions.find(
          (sub) => sub.userId.toString() === user._id.toString(),
        );
        return {
          ...user,
          subscribedAt: subscription?.createdAt || null,
        };
      });
    }

    return NextResponse.json({
      success: true,
      subscribers: subscriberDetails,
      pagination: {
        total: totalSubscribers,
        page,
        limit,
        pages: Math.ceil(totalSubscribers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 },
    );
  }
}
