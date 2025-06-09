import { NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const params = await props.params;
    const userId = params.id;

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const db = await connectToDB();

    // Find all registrations where user is checked in and event date has passed
    const currentDate = new Date();
    console.log("Current Date for comparison:", currentDate);

    // First convert the userId string to ObjectId
    const userObjectId = new ObjectId(userId);

    const attendedEvents = await db
      .collection("registrations")
      .aggregate([
        {
          $match: {
            userId: userId,
            checkedIn: true,
          },
        },
        {
          // Add a stage to convert string eventId to ObjectId
          $addFields: {
            eventObjectId: { $toObjectId: "$eventId" },
          },
        },
        {
          $lookup: {
            from: "events",
            localField: "eventObjectId", // Use the converted ObjectId
            foreignField: "_id",
            as: "eventDetails",
          },
        },
        {
          $unwind: "$eventDetails",
        },
        {
          $addFields: {
            // Convert string date to Date object if needed
            parsedEndDate: {
              $cond: {
                if: { $eq: [{ $type: "$eventDetails.endDate" }, "string"] },
                then: {
                  $dateFromString: { dateString: "$eventDetails.endDate" },
                },
                else: "$eventDetails.endDate",
              },
            },
          },
        },
        {
          $match: {
            parsedEndDate: { $lt: currentDate }, // Compare with parsed date
          },
        },
        {
          $project: {
            eventId: "$eventId",
            eventName: "$eventDetails.title",
            eventStartDate: "$eventDetails.startDate",
            eventEndDate: "$eventDetails.endDate",
            eventImage: "$eventDetails.imageUrl",
          },
        },
      ])
      .toArray();

    console.log("Attended Events:", attendedEvents);

    return NextResponse.json({ attendedEvents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attended events:", error);
    return NextResponse.json(
      { error: "Failed to fetch attended events" },
      { status: 500 },
    );
  }
}
