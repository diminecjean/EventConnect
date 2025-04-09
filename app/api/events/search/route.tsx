import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/app/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const date = searchParams.get("date") || "";
    const location = searchParams.get("location") || "";

    // Build search filter
    const filter: any = {};

    // Text search if query is provided
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { "tags.label": { $regex: query, $options: "i" } },
      ];
    }

    // Filter by category
    if (category && category !== "all") {
      filter["tags.label"] = { $regex: category, $options: "i" };
    }

    // Filter by date
    if (date) {
      const searchDate = new Date(date);
      // Find events happening on the selected date
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          // Event starts on the selected date
          {
            startDate: {
              $gte: new Date(searchDate.setHours(0, 0, 0, 0)),
              $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
            },
          },
          // Event ends on the selected date
          {
            endDate: {
              $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
              $lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
            },
          },
          // Event spans over the selected date
          {
            $and: [
              {
                startDate: {
                  $lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
                },
              },
              {
                endDate: {
                  $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                },
              },
            ],
          },
        ],
      });
    }

    // Filter by location
    if (location) {
      const locationFilter = { location: { $regex: location, $options: "i" } };
      if (filter.$and) {
        filter.$and.push(locationFilter);
      } else if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, locationFilter];
        delete filter.$or;
      } else {
        filter.location = locationFilter.location;
      }
    }

    const db = await connectToDB();

    // If no filters, return newest events first
    if (Object.keys(filter).length === 0) {
      filter.startDate = { $gte: new Date() }; // Only upcoming events
    }

    // Fetch events matching the filter
    const events = await db
      .collection("events")
      .find(filter)
      .sort({ startDate: 1 }) // Sort by date (upcoming first)
      .limit(20)
      .toArray();

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error searching events:", error);
    return NextResponse.json(
      { error: "Failed to search events" },
      { status: 500 },
    );
  }
}
