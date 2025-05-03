"use client";

import Image from "next/image";
import EventCard from "./events/eventCardComponent";
import SearchBar, { SearchParams, categories, locations } from "./searchBar";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/authContext";
import { useRouter } from "next/navigation";
import SeedDatabase from "./utils/seedDB";
import { BASE_URL } from "./api/constants";
import { Skeleton, SkeletonEventCard } from "@/components/ui/skeleton";

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
  const [isSearching, setIsSearching] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<FormattedEvent[] | null>(
    null,
  );
  const [activeFilters, setActiveFilters] = useState<SearchParams | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Get all events (initial load)
  async function getEvents() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/events`,
        {
          cache: "no-store",
          next: { revalidate: 60 }, // Revalidate every minute
        },
      );

      const data = await res.json();
      // Transform the API response to match the Event interface
      const formattedEvents = formatEvents(data.events);
      return formattedEvents;
    } catch (error) {
      console.error("Error loading events:", error);
      return [];
    }
  }

  // Format events from API to match our interface
  const formatEvents = (eventsData: any[]): FormattedEvent[] => {
    return eventsData.map((event: any) => ({
      _id: event._id.toString(),
      id: event._id.toString(), // Add id field which is required by FormattedEvent interface
      eventLogo: {
        src: event.imageUrl || "/placeholder.svg",
        alt: event.title,
        width: 300,
        height: 200,
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
  };

  // Initial loading of events
  useEffect(() => {
    setIsInitialLoading(true);
    getEvents().then((events) => {
      setEvents(events);
      setIsInitialLoading(false);
    });
  }, []);

  // Handle search
  const handleSearch = async (searchParams: SearchParams) => {
    setIsSearching(true);
    setActiveFilters(searchParams);

    try {
      // If all filters are empty/default, show all events
      if (
        !searchParams.query &&
        (searchParams.category === "all" || !searchParams.category) &&
        !searchParams.date &&
        !searchParams.location
      ) {
        setSearchResults(null);
        return;
      }

      // Build the search URL with filters
      const params = new URLSearchParams();
      if (searchParams.query) params.append("q", searchParams.query);
      if (searchParams.category && searchParams.category !== "all") {
        params.append("category", searchParams.category);
      }
      if (searchParams.date) {
        params.append("date", searchParams.date.toISOString().split("T")[0]);
      }
      if (searchParams.location)
        params.append("location", searchParams.location);

      // Call the API
      const response = await fetch(`${BASE_URL}/api/events/search?${params}`);
      const data = await response.json();

      // Format and set results
      const formattedEvents = formatEvents(data.events);
      setSearchResults(formattedEvents);
    } catch (error) {
      console.error("Error searching events:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get the list of events to display (search results or all events)
  const displayedEvents = searchResults !== null ? searchResults : events;

  // Get active filter summary text
  const getFilterSummary = () => {
    if (!activeFilters) return null;

    const filters = [];
    if (activeFilters.query) filters.push(`"${activeFilters.query}"`);

    if (activeFilters.category && activeFilters.category !== "all") {
      const categoryLabel = categories.find(
        (c) => c.id === activeFilters.category,
      )?.label;
      filters.push(categoryLabel);
    }

    if (activeFilters.date) {
      filters.push(`on ${activeFilters.date.toLocaleDateString()}`);
    }

    if (activeFilters.location) {
      const locationName = locations.find(
        (l) => l.id === activeFilters.location,
      )?.name;
      filters.push(`in ${locationName}`);
    }

    if (filters.length === 0) return null;

    return `Filtered by: ${filters.join(", ")}`;
  };

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
            <br /> specifically for the tech community.
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
        <div className="flex">{/* <SeedDatabase /> */}</div>
      </div>
      <SearchBar onSearch={handleSearch} isSearching={isSearching} />

      <div className="flex flex-col max-w-6xl place-items-center gap-6 w-full">
        <div className="w-full p-2 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {searchResults !== null ? "Search Results" : "Upcoming"}{" "}
            <span className="text-violet-400">Events</span>
          </h2>
          {getFilterSummary() && (
            <div className="text-sm text-gray-400">{getFilterSummary()}</div>
          )}
        </div>

        {isSearching ? (
          <div className="w-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : isInitialLoading ? (
          // Show skeletons when initially loading
          <div className="w-full flex flex-col gap-6">
            <SkeletonEventCard array={[1, 2, 3]} />
          </div>
        ) : displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <EventCard
              key={event._id}
              id={event._id}
              eventLogo={event.eventLogo}
              organizationId={event.organizationId}
              title={event.title}
              tags={event.tags}
              date={event.date}
              location={event.location}
              description={event.description}
            />
          ))
        ) : (
          <div className="w-full p-12 text-center border border-dashed rounded-lg border-gray-700">
            <p className="text-gray-400">
              {searchResults !== null
                ? "No events found matching your search criteria"
                : "No upcoming events found"}
            </p>
            {searchResults !== null && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => {
                  setSearchResults(null);
                  setActiveFilters(null);
                }}
              >
                View all events instead
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
