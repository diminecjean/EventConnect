import { notFound } from "next/navigation";
import eventsDataJson from "@/data/eventsData.json";
const { eventsData } = eventsDataJson;

import type { Event } from "../typings";

async function getEvent(id: string): Promise<Event | null> {
  // Simulating a database/API call

  return eventsData.find((event) => event.id === id) || null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params
  const event = await getEvent(id);
  
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} - Event Details`,
    description: event.description,
  };
}

export default async function EventPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params
  const event = await getEvent(id);

  if (!event) return notFound(); // Redirect to 404 page

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-gray-600">
        {event.date.fullDate} - {event.location}
      </p>
      <p className="mt-4">{event.description.details}</p>
    </main>
  );
}
