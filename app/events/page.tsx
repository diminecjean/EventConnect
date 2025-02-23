import Link from "next/link";

const events = [
  { id: "1", title: "Tech Meetup", date: "2025-03-10" },
  { id: "2", title: "AI Conference", date: "2025-04-05" },
];

export default function EventsPage() {
  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold">Upcoming Events</h1>
      <ul className="mt-4 space-y-2">
        {events.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="text-blue-600 hover:underline"
            >
              {event.title} - {event.date}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
