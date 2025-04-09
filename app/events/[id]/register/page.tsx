"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import RegistrationFormRenderer from "./RegistrationFormRenderer";
import { useRegistrationForm } from "./useRegistrationForm";
import { Event } from "@/app/typings/events/typings";
import Image from "next/image";

export default function EventRegistrationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { form, onSubmit, formFields, selectedFormType, setSelectedFormType } =
    useRegistrationForm(id);

  useEffect(() => {
    // Fetch event details including registration forms
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) throw new Error("Failed to fetch event");
        const res = await response.json();
        setEvent(res.event);
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (loading)
    return (
      // <div className="flex justify-center mt-20">
      //   Loading registration form...
      // </div>
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  if (!event) return <div className="p-8">Event not found</div>;
  if (!session)
    return <div className="p-8">Please sign in to register for this event</div>;

  return (
    <div className="w-full mx-auto p-6 mt-20">
      <div className="relative w-full h-64 overflow-hidden rounded-lg bg-violet-800">
        <Image
          className="object-cover"
          src={event.bannerUrl || "/default-banner.jpg"}
          alt={event.title + " banner"}
          fill
          sizes="100vw"
          priority
        />
      </div>
      <h1 className="text-2xl font-bold my-6">Register for {event.title}</h1>

      {event.registrationForms && event.registrationForms.length > 1 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Registration Type</h3>
          <select
            className="border bg-black p-2 rounded w-full"
            value={selectedFormType}
            onChange={(e) => setSelectedFormType(e.target.value)}
          >
            {event.registrationForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name} - {form.description}
              </option>
            ))}
          </select>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <RegistrationFormRenderer
            formFields={formFields}
            control={form.control}
          />

          <Button type="submit" className="w-full">
            Complete Registration
          </Button>
        </form>
      </Form>
    </div>
  );
}
