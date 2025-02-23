import Image from "next/image";
import { testDatabaseConnection } from "./actions";
import Link from "next/link";

import EventCard from "@/components/eventCardComponent";
import SearchBar from "./searchBar";

import { eventsData } from "@/data/eventsData.json";

export default async function Home() {
  const isConnected = await testDatabaseConnection();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between pt-20 ">
      <div className="w-full py-12 flex-col justify-start max-w-6xl">
        <h1 className="py-4 text-6xl font-bold text-left text-white">
          CONNECTING
          <br />
          DIMENSIONS.
        </h1>
        <p className="text-lg font-light dark:text-white pb-12">
          The first meetup platform made
          <br /> specificallly for the tech community.
        </p>
      </div>
      <SearchBar />

      <div className="flex flex-col max-w-6xl place-items-center gap-6">
        <div className="w-full p-2 justify-start text-xl font-semibold">
          Upcoming <span className="text-violet-400">Events</span>
        </div>
        {eventsData.map((event, index) => (
          <EventCard
            key={index}
            id={event.id}
            eventLogo={event.eventLogo}
            host={event.host}
            title={event.title}
            tags={event.tags}
            date={event.date}
            location={event.location}
            description={event.description}
          />
        ))}
      </div>
      <div className="fixed inset-0 -z-10">
        <Image
          src="/landingbg.png"
          fill
          alt="Landing page background"
          className="object-cover"
        />
      </div>
    </main>
  );
}
