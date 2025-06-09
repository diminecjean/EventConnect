"use client";

import Image from "next/image";
import EventCard from "./events/eventCardComponent";
import SearchBar, { SearchParams, locations } from "./searchBar";
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
  const [filteredResults, setFilteredResults] = useState<
    FormattedEvent[] | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [locationFilter, setLocationFilter] = useState("");
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
      id: event._id.toString(),
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
        startDate: new Date(event.startDate) || new Date(),
        endDate: new Date(event.endDate) || new Date(),
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

  // Apply client-side filters whenever filters change
  useEffect(() => {
    if (searchResults === null) {
      // If no search was performed, filter the default events
      applyFilters(events);
    } else {
      // Filter the search results
      applyFilters(searchResults);
    }
  }, [dateFilter, locationFilter, searchResults, events]);

  // Apply date and location filters to the provided events array
  const applyFilters = (eventsToFilter: FormattedEvent[]) => {
    if (!dateFilter && !locationFilter) {
      // No filters applied
      setFilteredResults(null);
      return;
    }

    let results = [...eventsToFilter];

    // Filter by date
    if (dateFilter) {
      const startOfDay = new Date(dateFilter);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(dateFilter);
      endOfDay.setHours(23, 59, 59, 999);

      results = results.filter((event) => {
        const eventStart = new Date(event.date.startDate);
        const eventEnd = new Date(event.date.endDate);

        // Event starts on the selected date
        const startsOnDate = eventStart >= startOfDay && eventStart <= endOfDay;

        // Event ends on the selected date
        const endsOnDate = eventEnd >= startOfDay && eventEnd <= endOfDay;

        // Event spans over the selected date
        const spansOverDate = eventStart <= endOfDay && eventEnd >= startOfDay;

        return startsOnDate || endsOnDate || spansOverDate;
      });
    }

    // Filter by location
    if (locationFilter) {
      const locationName =
        locations.find((l) => l.id === locationFilter)?.name || "";
      results = results.filter((event) =>
        event.location.toLowerCase().includes(locationName.toLowerCase()),
      );
    }

    setFilteredResults(results);
  };

  // Handle search - only text search via API
  const handleSearch = async (searchParams: SearchParams) => {
    setIsSearching(true);
    setSearchQuery(searchParams.query);
    setDateFilter(searchParams.date || null);
    setLocationFilter(searchParams.location);

    try {
      // If query is empty, reset to all events
      if (!searchParams.query || searchParams.query.trim() === "") {
        setSearchResults(null);
        setIsSearching(false);
        return;
      }

      // Build the search URL with query only
      const params = new URLSearchParams();
      params.append("q", searchParams.query.trim());

      // Call the API
      const response = await fetch(`${BASE_URL}/api/events/search?${params}`);

      if (!response.ok) {
        throw new Error(
          `Search request failed with status: ${response.status}`,
        );
      }

      const data = await response.json();

      // Check if data has expected structure
      if (!data || !Array.isArray(data.events)) {
        console.error("Unexpected response format:", data);
        throw new Error("Invalid response format from search API");
      }

      // Format and set results
      const formattedEvents = formatEvents(data.events);
      console.log(
        `Search for "${searchParams.query}" returned ${formattedEvents.length} results`,
      );
      setSearchResults(formattedEvents);
    } catch (error) {
      console.error("Error searching events:", error);
      // Show the error to the user
      alert(`Search error: ${error}. Please try again.`);
    } finally {
      setIsSearching(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter(null);
    setLocationFilter("");
    setSearchResults(null);
    setFilteredResults(null);
  };

  // Get the list of events to display (filtered results, search results, or all events)
  const displayedEvents =
    filteredResults !== null
      ? filteredResults
      : searchResults !== null
        ? searchResults
        : events;

  // Get active filter summary text
  const getFilterSummary = () => {
    const filters = [];
    if (searchQuery) filters.push(`"${searchQuery}"`);

    if (dateFilter) {
      filters.push(`on ${dateFilter.toLocaleDateString()}`);
    }

    if (locationFilter) {
      const locationName = locations.find((l) => l.id === locationFilter)?.name;
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
      <SearchBar
        onSearch={handleSearch}
        isSearching={isSearching}
        initialDate={dateFilter}
        initialLocation={locationFilter}
        initialQuery={searchQuery}
      />

      <div className="flex flex-col max-w-6xl place-items-center gap-6 w-full">
        <div className="w-full p-2 flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {searchResults !== null || filteredResults !== null
              ? "Search Results"
              : "Upcoming"}{" "}
            <span className="text-violet-400">Events</span>
          </h2>
          {getFilterSummary() && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <span>{getFilterSummary()}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={clearFilters}
              >
                <span className="sr-only">Clear filters</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12"></path>
                </svg>
              </Button>
            </div>
          )}
        </div>

        {isSearching ? (
          <div className="w-full py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
          </div>
        ) : isInitialLoading ? (
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
              {searchResults !== null || filteredResults !== null
                ? "No events found matching your search criteria"
                : "No upcoming events found"}
            </p>
            {(searchResults !== null || filteredResults !== null) && (
              <Button variant="link" className="mt-2" onClick={clearFilters}>
                View all events instead
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
