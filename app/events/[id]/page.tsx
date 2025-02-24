import { notFound } from "next/navigation";
import eventsData from "@/data/eventsData.json";
import type { Event } from "../typings";

async function getEvent(id: string): Promise<Event | null> {
  return eventsData.find((event) => event.id === id) || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title} - Event Details`,
    description: event.description.preview,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) return notFound();

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-gray-600">
        {event.date.fullDate} - {event.location}
      </p>
      <p className="mt-4">{event.description.preview}</p>
      <ul className="mt-4 list-disc list-inside">
        {event.description.details.map((detail, index) => (
          <li key={index}>{detail}</li>
        ))}
      </ul>
    </main>
  );
}
