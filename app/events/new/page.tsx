"use client";
import { useSearchParams } from "next/navigation";
import EventForm from "../eventForm"; 

export default function NewEventPage() {
  const searchParams = useSearchParams();
  const organizationId = searchParams.get("orgId") as string;
  const organizationName = searchParams.get("orgName") as string;
  
  if (!organizationId) {
    // Handle case where no organization ID is provided
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-semibold mb-4">Missing Organization ID</h1>
        <p>An organization ID is required to create an event.</p>
      </div>
    );
  }
  
  return (
    <main className="w-full mt-20 flex flex-col gap-4">
        <EventForm organizationId={organizationId} organizationName={organizationName}/>
    </main>
  );
}