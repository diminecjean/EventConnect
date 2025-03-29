"use client";

import { useParams, useSearchParams } from "next/navigation";
import EventForm from "../../eventForm"; 
import { cp } from "fs";

export default function EditEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.id as string;
  const eventName = params.name as string
  const organizationId = searchParams.get("orgId") as string;
  
  if (!organizationId) {
    // Handle case where no organization ID is provided
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold mb-4">Missing Organization ID</h1>
        <p>An organization ID is required to edit this event.</p>
      </div>
    );
  }
  
  return <EventForm organizationId={organizationId} eventId={eventId} eventName={eventName} />;
}