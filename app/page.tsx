"use client";

import Image from "next/image";

import EventCard from "./events/eventCardComponent";
import SearchBar from "./searchBar";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import SeedDatabase from "./utils/seedDB";

interface Tag {
  label: string;
  color: string;
}

interface FormattedEvent {
  _id: string;
  id: string;
  eventLogo: { src: string; alt: string; width: number; height: number };
  organizationId: string;
  title: string;
  tags: Tag[];
  date: { startDate: Date; endDate: Date };
  location: string;
  description: string;
}

export default function Home() {
  const [events, setEvents] = useState<FormattedEvent[]>([]);
  const { user } = useAuth();
  const router = useRouter();
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
        _id: event._id.toString(),
        eventLogo: {
          src: event.imageUrl || "/placeholder.svg",
          alt: event.title,
          width: 300, // Add default width
          height: 200, // Add default height
        },
        organizationId: event.organizationId,
        title: event.title || "",
        tags: Array.isArray(event.tags) ? event.tags : [],
        date: {
          startDate: event.startDate || "TBA",
          endDate: event.endDate || "",
        },
        location: event.location || "TBA",
        description: event.description,
      }));
      return formattedEvents as FormattedEvent[];
    } catch (error) {
      console.error("Error loading events:", error);
      return [];
    }
  }

  useEffect(() => {
    getEvents().then((events) => {
      setEvents(events);
      // console.log("Events:", events);
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
          {!user && (
            <Button
              onClick={() => router.push("/signup")}
              variant="secondary"
              className="p-4 font-semibold"
            >
              Sign Up Now
            </Button>
          )}
        </div>
        <div className="flex">
          <SeedDatabase />
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
            id={event._id}
            eventLogo={event.eventLogo}
            organizationId={event.organizationId}
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
