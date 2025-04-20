"use client";
import { useSearchParams } from "next/navigation";
import EventForm from "../eventForm";
import { Suspense } from "react";

// Create a separate component that uses useSearchParams
function NewEventForm() {
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
      <EventForm
        organizationId={organizationId}
        organizationName={organizationName}
      />
    </main>
  );
}

// Main page component with Suspense
export default function NewEventPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-20 p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      }
    >
      <NewEventForm />
    </Suspense>
  );
}
