import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const eventId = params.id;
    const db = await connectToDB();

    // Get event details
    const event = await db
      .collection("events")
      .findOne({ _id: new ObjectId(eventId) });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get registration stats over time
    const registrationOverTime = await db
      .collection("registrations")
      .aggregate([
        { $match: { eventId: eventId } },
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

    // Get check-in stats
    const checkInStats = await db
      .collection("registrations")
      .aggregate([
        { $match: { eventId: eventId } },
        {
          $group: {
            _id: null,
            totalRegistrations: { $sum: 1 },
            checkedIn: {
              $sum: { $cond: [{ $eq: ["$checkedIn", true] }, 1, 0] },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalRegistrations: 1,
            checkedIn: 1,
            checkInRate: {
              $cond: [
                { $eq: ["$totalRegistrations", 0] },
                0,
                { $divide: ["$checkedIn", "$totalRegistrations"] },
              ],
            },
          },
        },
      ])
      .toArray();

    // TODO: Get attendee ratings
    const attendeeRatings = await db
      .collection("eventFeedback")
      .aggregate([
        { $match: { eventId: eventId } },
        {
          $group: {
            _id: "$rating", // Assuming ratings are 1-5
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Get attendee demographics
    const attendeeDemographics = await db
      .collection("registrations")
      .aggregate([
        { $match: { eventId: eventId } },
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
              // Use whatever demographic fields you store
              position: "$userDetails.position",
              organization: "$userDetails.organization",
            },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Get feedback comments (if you store them)
    const feedbackComments = await db
      .collection("eventFeedback")
      .find({
        eventId: eventId,
        comment: { $exists: true, $ne: "" },
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      registrationOverTime,
      checkInStats: checkInStats[0] || {
        totalRegistrations: 0,
        checkedIn: 0,
        checkInRate: 0,
      },
      attendeeRatings,
      attendeeDemographics,
      feedbackComments,
    });
  } catch (error) {
    console.error("Error fetching event stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch event statistics" },
      { status: 500 },
    );
  }
}
