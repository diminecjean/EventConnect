"use client";

import Image from "next/image";
import Link from "next/link";

import EventCard from "./events/eventCardComponent";
import SearchBar from "./searchBar";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import eventsData from "@/data/eventsData.json";
import eventsDataComplete from "@/data/eventsDataComplete.json";

interface Tag {
  id: string;
  label: string;
  color: string;
}

interface Event {
  id: string;
  eventLogo: { src: string; alt: string; width: number; height: number };
  host: { logo: string; name: string };
  title: string;
  tags: Tag[];
  date: { fullDate: string; time: string };
  location: string;
  description: { preview: string; details: string[] };
}

// Seeds event data only
function SeedDatabase() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const seedDatabase = async () => {
    try {
      setStatus("loading");
      setMessage("Seeding database...");

      const response = await fetch("/api/admin/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventsDataComplete), // Send array directly
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed database");
      }

      setStatus("success");
      setMessage(`Success! Added ${data.count} events to database.`);
    } catch (error) {
      console.error("Error seeding database:", error);
      setStatus("error");
      setMessage(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="p-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Admin: Seed Database</h1>
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          This will add all events from the JSON file to the MongoDB database.
        </p>
        <Button
          onClick={seedDatabase}
          disabled={status === "loading"}
          className="px-6 py-2"
        >
          {status === "loading" ? "Seeding..." : "Seed Database"}
        </Button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            status === "success"
              ? "bg-green-50 text-green-800"
              : status === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  async function getEvents() {
    try {
      // Use server-side fetch with no-cache to get latest data
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/events`,
        {
          cache: "no-store",
          next: { revalidate: 60 }, // Revalidate every minute
        },
      );
      const data = await res.json();
      // You might need to transform the API response to match the Event interface
      const formattedEvents = data.events.map((event: any) => ({
        id: event.id,
        eventLogo: {
          src: event.eventLogo?.src || "/placeholder.svg",
          alt: event.eventLogo?.alt || event.title,
          width: 300, // Add default width
          height: 200, // Add default height
        },
        host: {
          logo: event.host?.logo || "",
          name: event.host?.name || "Unknown Host",
        },
        title: event.title || "",
        tags: Array.isArray(event.tags)
          ? event.tags.map((tag: any) => ({
              id: tag.id || tag.label || String(Math.random()),
              label: tag.label || "Tag",
              color: tag.color || "bg-gray-100",
            }))
          : [],
        date: {
          fullDate: event.date?.fullDate || "TBA",
          time: event.date?.time || "",
        },
        location: event.location || "TBA",
        description: {
          preview: event.description?.preview || event.description || "",
          details: Array.isArray(event.description?.details)
            ? event.description.details
            : [event.description?.preview || event.description || ""],
        },
      }));
      return formattedEvents as Event[];
    } catch (error) {
      console.error("Error loading events:", error);
      return [];
    }
  }

  useEffect(() => {
    getEvents().then((events) => {
      setEvents(events);
      console.log("Events:", events);
    });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-20 ">
      <div className="flex flex-row w-full py-12 justify-start max-w-6xl">
        <div className="flex-col">
          <h1 className="py-4 text-3xl sm:text-4xl md:text-6xl font-bold text-left text-white">
            CONNECTING
            <br />
            DIMENSIONS.
          </h1>
          <p className="text-lg font-light dark:text-white pb-12">
            The first meetup platform made
            <br /> specificallly for the tech community.
          </p>
        </div>
        <div className="flex">
          <SeedDatabase/>
        </div>
      </div>
      <SearchBar />

      <div className="flex flex-col max-w-6xl place-items-center gap-6">
        <div className="w-full p-2 justify-start text-xl font-semibold">
          Upcoming <span className="text-violet-400">Events</span>
        </div>
        {events.map((event, index) => (
          <EventCard
            key={index}
            id={event.id}
            eventLogo={event.eventLogo}
            host={event.host}
            title={event.title}
            tags={event.tags}
            date={event.date}
            location={event.location}
            description={event.description}
          />
        ))}
      </div>
      <div className="fixed inset-0 -z-10">
        <Image
          src="/landingbg.png"
          fill
          alt="Landing page background"
          className="object-cover"
        />
      </div>
    </main>
  );
}
