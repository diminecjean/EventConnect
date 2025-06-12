import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  _request: NextRequest, // Prefix with underscore to indicate it's unused
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const organizationId = params.id;
    const db = await connectToDB();

    // Get all events for this organization
    const events = await db
      .collection("events")
      .find({ organizationId: organizationId })
      .toArray();

    const eventIds = events.map((event) =>
      event._id instanceof ObjectId ? event._id.toString() : event._id,
    );

    // Get subscription stats over time
    const subscriptionStats = await db
      .collection("subscriptions")
      .aggregate([
        { $match: { organizationId: organizationId } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray();

    // Get registration stats for all organization events
    // We'll use $lookup to get event details directly in the pipeline
    const registrationStats = await db
      .collection("registrations")
      .aggregate([
        { $match: { eventId: { $in: eventIds } } },
        {
          $group: {
            _id: "$eventId",
            totalRegistrations: { $sum: 1 },
            checkedIn: {
              $sum: { $cond: [{ $eq: ["$checkedIn", true] }, 1, 0] },
            },
          },
        },
        {
          $lookup: {
            from: "events",
            let: { eventId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$eventId" }],
                  },
                },
              },
              {
                $project: {
                  title: 1,
                },
              },
            ],
            as: "eventDetails",
          },
        },
        {
          $addFields: {
            eventName: {
              $cond: [
                { $gt: [{ $size: "$eventDetails" }, 0] },
                { $arrayElemAt: ["$eventDetails.title", 0] },
                "Unknown Event",
              ],
            },
          },
        },
        // Fix: Use a separate $project stage that only includes what we want
        {
          $project: {
            _id: 1,
            eventName: 1,
            totalRegistrations: 1,
            checkedIn: 1,
          },
        },
      ])
      .toArray();

    // Aggregate attendee demographics across all events
    const attendeeDemographics = await db
      .collection("registrations")
      .aggregate([
        { $match: { eventId: { $in: eventIds } } },
        {
          $lookup: {
            from: "users",
            let: { userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", { $toObjectId: "$$userId" }],
                  },
                },
              },
            ],
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $group: {
            _id: {
              // Group by whatever demographic info you store
              position: "$userDetails.position",
              organization: "$userDetails.organization",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const attendeeRatings = await db
      .collection("feedback")
      .aggregate([
        { $match: { eventId: { $in: eventIds } } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return NextResponse.json({
      subscriptionStats,
      registrationStats,
      attendeeDemographics,
      totalEvents: events.length,
      eventIds,
      attendeeRatings,
    });
  } catch (error) {
    console.error("Error fetching organization stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization statistics" },
      { status: 500 },
    );
  }
}
