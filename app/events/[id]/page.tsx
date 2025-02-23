import { notFound } from "next/navigation";

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
};

async function getEvent(id: string): Promise<Event | null> {
  // Simulating a database/API call
  const events: Event[] = [
    {
      id: "1",
      title: "Tech Meetup",
      description: "A great tech meetup.",
      date: "2025-03-10",
      location: "Kuala Lumpur",
    },
    {
      id: "2",
      title: "AI Conference",
      description: "Deep dive into AI.",
      date: "2025-04-05",
      location: "Singapore",
    },
  ];

  return events.find((event) => event.id === id) || null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
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
  const event = await getEvent(params.id);

  if (!event) return notFound(); // Redirect to 404 page

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-gray-600">
        {event.date} - {event.location}
      </p>
      <p className="mt-4">{event.description}</p>
    </main>
  );
}
