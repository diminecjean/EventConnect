import { connectToDB } from "@/app/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    // Connect to database
    const db = await connectToDB();
    const eventsCollection = db.collection("events"); // Make sure to specify the collection name

    // Build the search pipeline
    const pipeline = [];

    // Text search using Atlas Search if query is provided
    if (query && query.trim() !== "") {
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            should: [
              {
                text: {
                  query: query,
                  path: "title",
                  score: { boost: { value: 3 } },
                },
              },
              {
                text: {
                  query: query,
                  path: "description",
                  score: { boost: { value: 1 } },
                },
              },
              {
                text: {
                  query: query,
                  path: "location",
                  score: { boost: { value: 2 } },
                },
              },
              {
                text: {
                  query: query,
                  path: "tags.label",
                  score: { boost: { value: 2 } },
                },
              },
            ],
          },
        },
      });

      // Add score field for sorting by relevance
      pipeline.push({
        $addFields: {
          score: { $meta: "searchScore" },
        },
      });

      // Sort by relevance
      pipeline.push({ $sort: { score: -1, startDate: 1 } });
    } else {
      // If no query, sort by start date
      pipeline.push({ $sort: { startDate: 1 } });
    }

    // Limit to 100 results
    pipeline.push({ $limit: 100 });

    // Add debugging for transparency
    console.log("Search query:", query);
    console.log("Pipeline:", JSON.stringify(pipeline, null, 2));

    // Execute the aggregation pipeline on the events collection
    const events = await eventsCollection.aggregate(pipeline).toArray();

    console.log(`Found ${events.length} matching events`);

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search events", details: error },
      { status: 500 },
    );
  }
}
