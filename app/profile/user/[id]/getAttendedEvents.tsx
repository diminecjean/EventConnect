"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BASE_URL } from "@/app/api/constants";
import { formatEventDateTime } from "@/app/utils/formatDate";

type AttendedEvent = {
  eventId: string;
  eventName: string;
  eventStartDate: string | Date;
  eventEndDate: string | Date;
  eventImage?: string;
};

export default function AttendedEventsList({ userId }: { userId: string }) {
  const [attendedEvents, setAttendedEvents] = useState<AttendedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendedEvents() {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/users/${userId}/attended-events`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch attended events");
        }

        const data = await response.json();
        setAttendedEvents(data.attendedEvents || []);
      } catch (error) {
        console.error("Error fetching attended events:", error);
        setAttendedEvents([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAttendedEvents();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[...Array(attendedEvents.length)].map((_, i) => (
          <div
            key={i}
            className="p-3 border border-gray-200 rounded-md animate-pulse"
          >
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (attendedEvents.length === 0) {
    return (
      <p className="text-sm text-gray-400 italic">
        No events attended yet. Browse events now{" "}
        <Link href="/" className="text-violet-400">
          here
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {attendedEvents.map((event, index) => (
        <Link
          key={index}
          href={`/events/${event.eventId}`}
          className="block p-3 border border-gray-200 rounded-md hover:bg-violet-400/20 transition"
        >
          <div className="flex items-center gap-2">
            {event.eventImage && (
              <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={event.eventImage}
                  alt={event.eventName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{event.eventName}</p>
              <p className="text-xs text-gray-400">
                {
                  formatEventDateTime(event.eventStartDate, event.eventEndDate)
                    .date
                }{" "}
                {
                  formatEventDateTime(event.eventStartDate, event.eventEndDate)
                    .time
                }
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
