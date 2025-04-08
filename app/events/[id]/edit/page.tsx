"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import EventForm from "../../eventForm";
import { BASE_URL } from "@/app/api/constants";
import { Event } from "@/app/typings/events/typings";
import { EventFormValues } from "../../eventFormComponents/schemas";

export default function EditEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = params.id as string;
  const eventName = searchParams.get("eventName") as string;
  const organizationId = searchParams.get("orgId") as string;
  const [isLoading, setIsLoading] = useState(true);
  const [eventData, setEventData] = useState<Partial<EventFormValues> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/events/${eventId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }

        const res = await response.json();
        console.log("Raw event data:", res.event);

        // Helper function to safely convert any date format to a Date object
        const ensureDate = (dateValue: any): Date | undefined => {
          if (!dateValue) return undefined;

          try {
            // Handle MongoDB date format which might have $date property
            const dateString = dateValue.$date || dateValue;
            const date = new Date(dateString);

            // Check if the date is valid
            return isNaN(date.getTime()) ? undefined : date;
          } catch (error) {
            console.error("Error parsing date:", error);
            return undefined;
          }
        };

        // Transform the event data to match the form's expected types
        const formattedEvent: Partial<EventFormValues> = {
          ...res.event,
          // All date fields need to be proper Date objects
          startDate: ensureDate(res.event.startDate),
          endDate: ensureDate(res.event.endDate),
          startTime: ensureDate(res.event.startDate),
          endTime: ensureDate(res.event.endDate),
          // Ensure other fields have the correct types
          maxAttendees: res.event.maxAttendees
            ? Number(res.event.maxAttendees)
            : undefined,
          organizationId: res.event.organizationId || organizationId,
          // If there are any array fields that might be strings in the DB, ensure they're arrays
          partnerOrganizations: Array.isArray(res.event.partnerOrganizations)
            ? res.event.partnerOrganizations
            : [],
          timelineItems: Array.isArray(res.event.timelineItems)
            ? res.event.timelineItems.map((item: { date: any }) => ({
                ...item,
                date: ensureDate(item.date),
              }))
            : [],
          speakers: Array.isArray(res.event.speakers) ? res.event.speakers : [],
          sponsors: Array.isArray(res.event.sponsors) ? res.event.sponsors : [],
          galleryImages: Array.isArray(res.event.galleryImages)
            ? res.event.galleryImages
            : [],
          formFields: Array.isArray(res.event.formFields)
            ? res.event.formFields
            : [],
        };

        console.log("Formatted event data for form:", formattedEvent);
        setEventData(formattedEvent);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, organizationId]);

  // Your existing loading and error states...

  console.log("Event data:", eventData);
  return (
    <main className="w-full mt-20 flex flex-col gap-4">
      <EventForm
        organizationId={organizationId}
        eventId={eventId}
        eventName={eventName || eventData?.title || ""}
        defaultValues={eventData || {}}
      />
    </main>
  );
}
