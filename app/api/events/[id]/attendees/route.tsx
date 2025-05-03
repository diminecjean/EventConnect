import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    // Verify we have an ID
    if (!params || !params.id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    const id = params.id;
    const db = await connectToDB();

    const event = await db.collection("events").findOne({
      _id: new ObjectId(id),
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    console.log("Event found:", { eventId: id });

    // First check if we have any registrations for this event
    const count = await db
      .collection("registrations")
      .countDocuments({ eventId: id });
    console.log(`Found ${count} registrations for event ${id}`);

    // Debugging: Fetch a sample registration to see field structure
    if (count > 0) {
      const sampleReg = await db
        .collection("registrations")
        .findOne({ eventId: id });
      console.log("Sample registration:", JSON.stringify(sampleReg, null, 2));

      if (sampleReg?.userId) {
        console.log("userId type:", typeof sampleReg.userId);

        // If userId exists, check if we can find the corresponding user
        const user = await db.collection("users").findOne({
          _id:
            typeof sampleReg.userId === "string"
              ? new ObjectId(sampleReg.userId)
              : sampleReg.userId,
        });
        console.log("Found matching user:", !!user);
      }
    }

    // Get all registrations for this event with user details
    const attendees = await db
      .collection("registrations")
      .aggregate([
        { $match: { eventId: id } },
        {
          // Add a stage to convert string userId to ObjectId if needed
          $addFields: {
            userIdObj: {
              $cond: {
                if: { $eq: [{ $type: "$userId" }, "string"] },
                then: { $toObjectId: "$userId" },
                else: "$userId",
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userIdObj", // Use the converted ID
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          // Only unwrap if userDetails array has elements
          $match: {
            "userDetails.0": { $exists: true },
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            userId: {
              _id: "$userDetails._id",
              name: "$userDetails.name",
              email: "$userDetails.email",
            },
            registrationDate: { $ifNull: ["$registrationDate", "$createdAt"] },
            formResponses: { $ifNull: ["$formData", {}] },
            checkedIn: { $ifNull: ["$checkedIn", false] },
            checkedInTime: "$checkedInTime",
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    console.log(`After aggregation: found ${attendees.length} attendees`);
    if (attendees.length > 0) {
      console.log(
        "Sample attendee structure:",
        JSON.stringify(attendees[0], null, 2),
      );
    } else {
      // If no attendees found, try a simpler approach with manual joining
      const registrations = await db
        .collection("registrations")
        .find({ eventId: id })
        .toArray();

      const manualAttendees = [];

      for (const reg of registrations) {
        try {
          // Try to find the user, handling both string and ObjectId cases
          const user = await db.collection("users").findOne({
            _id:
              typeof reg.userId === "string"
                ? new ObjectId(reg.userId)
                : reg.userId,
          });

          if (user) {
            manualAttendees.push({
              _id: reg._id,
              userId: {
                _id: user._id,
                name: user.name,
                email: user.email,
              },
              registrationDate: reg.registrationDate || reg.createdAt,
              formResponses: reg.formData || {},
              checkedIn: reg.checkedIn || false,
              checkedInTime: reg.checkinTime,
            });
          }
        } catch (err) {
          console.error("Error processing registration:", err);
        }
      }

      console.log(`Manual joining found ${manualAttendees.length} attendees`);

      if (manualAttendees.length > 0) {
        return NextResponse.json(
          { attendees: manualAttendees },
          { status: 200 },
        );
      }
    }

    return NextResponse.json({ attendees }, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 },
    );
  }
}
