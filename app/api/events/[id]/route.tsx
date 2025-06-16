import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";
import { ObjectId, Db } from "mongodb";
import { formatSingleDate } from "@/app/utils/formatDate";

// GET single event by ID
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

    // Try to find by MongoDB ObjectId first, then by custom ID field
    let event = null;

    if (ObjectId.isValid(id)) {
      event = await db.collection("events").findOne({
        _id: new ObjectId(id),
      });
    }

    // If not found by ObjectId, try by custom id field
    if (!event) {
      console.log("Checking for event by ObjectId:", id);
      event = await db.collection("events").findOne({ id: id });
    }

    // Return 404 if event not found
    if (!event) {
      console.log("Event not found:", id);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    return NextResponse.json(
      {
        status: "success",
        event,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 },
    );
  }
}

// Helper function to create badges
async function createBadgeForFormType(
  db: Db,
  eventData: any,
  eventId: string,
  formType: string,
) {
  try {
    const formattedStartDate = formatSingleDate(eventData.startDate);
    const badgeType = formType.toUpperCase();

    let badgeDescription = "";
    if (badgeType === "SPEAKER") {
      badgeDescription = `Spoke at ${eventData.title}, which took place on ${formattedStartDate} at ${eventData.location}.`;
    } else if (badgeType === "SPONSOR") {
      badgeDescription = `Sponsored ${eventData.title}, which took place on ${formattedStartDate} at ${eventData.location}.`;
    }

    const badge = {
      name: `${eventData.title} ${formType}`,
      description: badgeDescription,
      type: badgeType,
      imageUrl: eventData.coverImageUrl || null,
      organizationId: eventData.organizationId,
      eventId: eventId,
      createdAt: new Date(),
    };

    await db.collection("badges").insertOne(badge);
    return true;
  } catch (error) {
    console.error(`Failed to create ${formType} badge:`, error);
    return false;
  }
}

// PUT - Update an event by ID
export async function PUT(
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
    const updateData = await request.json();

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.id;
    delete updateData.createdAt;

    const db = await connectToDB();

    // Get the original event to check for form changes
    let originalEvent = null;
    if (ObjectId.isValid(id)) {
      originalEvent = await db
        .collection("events")
        .findOne({ _id: new ObjectId(id) });
    } else {
      originalEvent = await db.collection("events").findOne({ id: id });
    }

    // Try to update by MongoDB ObjectId first, then by custom ID field
    let result = null;

    if (ObjectId.isValid(id)) {
      result = await db
        .collection("events")
        .updateOne(
          { _id: new ObjectId(id) },
          { $set: { ...updateData, updatedAt: new Date() } },
        );
    }

    // If not found by ObjectId, try by custom id field
    if (!result?.matchedCount) {
      result = await db
        .collection("events")
        .updateOne(
          { id: id },
          { $set: { ...updateData, updatedAt: new Date() } },
        );
    }

    // Return 404 if event not found
    if (!result?.matchedCount) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get the updated event
    let updatedEvent = null;
    if (ObjectId.isValid(id)) {
      updatedEvent = await db
        .collection("events")
        .findOne({ _id: new ObjectId(id) });
    } else {
      updatedEvent = await db.collection("events").findOne({ id: id });
    }

    // Create notifications and handle badge creation
    if (updatedEvent) {
      // Check for form changes and create badges as needed
      const originalForms = originalEvent?.registrationForms || [];
      const updatedForms = updateData.registrationForms || [];

      // Find form types that exist in updated forms but not in original forms
      const originalFormTypes = new Set(
        originalForms.map((form: any) => form.name),
      );
      const eventIdToUse = updatedEvent._id.toString();

      // Check for Speaker form
      if (
        updatedForms.some((form: any) => form.name === "Speaker") &&
        !originalFormTypes.has("Speaker")
      ) {
        // Speaker form is new - create a speaker badge
        await createBadgeForFormType(db, updatedEvent, eventIdToUse, "Speaker");
      }

      // Check for Sponsor form
      if (
        updatedForms.some((form: any) => form.name === "Sponsor") &&
        !originalFormTypes.has("Sponsor")
      ) {
        // Sponsor form is new - create a sponsor badge
        await createBadgeForFormType(db, updatedEvent, eventIdToUse, "Sponsor");
      }

      // Create update notifications for subscribers
      const subscribers = await db
        .collection("subscriptions")
        .find({ organizationId: updateData.organizationId })
        .toArray();

      const orgData = await db.collection("organizations").findOne({
        _id: new ObjectId(updateData.organizationId),
      });

      if (orgData && subscribers.length > 0) {
        // Create notifications for all subscribers
        const notifications = subscribers.map((subscription) => ({
          recipientId: subscription.userId,
          type: "UPDATE_EVENT",
          title: `Event Updated by ${orgData.name}`,
          content: `${orgData.name} updated an event: ${updateData.title}`,
          eventId: updatedEvent._id,
          senderId: updateData.organizationId,
          isRead: false,
          createdAt: new Date(),
        }));

        // Insert notifications to database
        await db.collection("notifications").insertMany(notifications);
      }
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Event updated successfully",
        event: updatedEvent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}

// DELETE - Delete an event by ID
export async function DELETE(
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

    // Get the event first (to use for notifications)
    let eventToDelete = null;

    if (ObjectId.isValid(id)) {
      eventToDelete = await db.collection("events").findOne({
        _id: new ObjectId(id),
      });
    } else {
      eventToDelete = await db.collection("events").findOne({ id: id });
    }

    if (!eventToDelete) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get organization data for notifications
    const orgData = await db.collection("organizations").findOne({
      _id: new ObjectId(eventToDelete.organizationId),
    });

    // Try to delete by MongoDB ObjectId first, then by custom ID field
    let result = null;

    if (ObjectId.isValid(id)) {
      result = await db.collection("events").deleteOne({
        _id: new ObjectId(id),
      });
    } else {
      result = await db.collection("events").deleteOne({ id: id });
    }

    // Return 404 if event not found (shouldn't happen since we already checked)
    if (!result?.deletedCount) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Clean up related data - delete registrations, feedback, etc.
    await db.collection("registrations").deleteMany({ eventId: id });
    await db.collection("feedback").deleteMany({ eventId: id });

    // Create notifications for subscribers
    if (orgData) {
      const subscribers = await db
        .collection("subscriptions")
        .find({ organizationId: eventToDelete.organizationId })
        .toArray();

      if (subscribers.length > 0) {
        // Create notifications for all subscribers
        const notifications = subscribers.map((subscription) => ({
          recipientId: subscription.userId,
          type: "DELETE_EVENT",
          title: `Event Cancelled by ${orgData.name}`,
          content: `${orgData.name} cancelled an event: ${eventToDelete.title}`,
          senderId: eventToDelete.organizationId,
          isRead: false,
          createdAt: new Date(),
        }));

        // Insert notifications to database
        await db.collection("notifications").insertMany(notifications);
      }
    }

    return NextResponse.json(
      {
        status: "success",
        message: "Event deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 },
    );
  }
}
