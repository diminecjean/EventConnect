import Link from "next/link";
import eventsDataJson from "@/data/eventsData.json";

const { eventsData } = eventsDataJson;

// TODO: Remove this page
export default function EventsPage() {
  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold">Upcoming Events</h1>
      <ul className="mt-4 space-y-2">
        {eventsData.map((event) => (
          <li key={event.id}>
            <Link
              href={`/events/${event.id}`}
              className="text-blue-600 hover:underline"
            >
              {event.title} - {event.date.fullDate}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
