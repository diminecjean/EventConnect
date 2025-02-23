import Image from "next/image";
import { testDatabaseConnection } from "./actions";
import Link from "next/link";

import EventCard from "@/components/eventCardComponent";
import SearchBar from "./searchBar";

const eventsData = [
  {
    eventLogo: {
      src: "/notionai.svg",
      alt: "Notion AI Event Poster",
    },
    host: {
      logo: "/notion.svg",
      name: "Notion@USM",
    },
    title: "Explore Notion AI",
    href: "/",
    tags: [
      { label: "Tech", color: "bg-gray-100" },
      { label: "Artificial Intelligence", color: "bg-red-200" },
    ],
    date: {
      fullDate: "18 March 2024",
      time: "10:00 AM - 12:00 PM",
    },
    location: "Asia Pacific University of Technology and Innovation",
    description: {
      preview:
        "Ready to supercharge your productivity? Join us for an exciting evening exploring the power of Notion AI! Discover how AI can transform your workflow and boost your productivity! Limited spots available - first 40 participants only! 🎯",
      details: [
        "🍽️ Food will be provided",
        "✨ Learn practical AI implementations",
        "💡 Hands-on experience",
        "🤝 Network with fellow Notion enthusiasts",
      ],
    },
  },
  {
    eventLogo: {
      src: "/figma.svg",
      alt: "Figma Workshop Poster",
    },
    host: {
      logo: "/figma.svg",
      name: "Figma Malaysia",
    },
    title: "Design Systems Workshop",
    href: "/",
    tags: [
      { label: "Design", color: "bg-purple-100" },
      { label: "UI/UX", color: "bg-blue-200" },
    ],
    date: {
      fullDate: "20 March 2024",
      time: "2:00 PM - 5:00 PM",
    },
    location: "Sunway University",
    description: {
      preview:
        "Join us for an intensive workshop on building design systems in Figma. Learn best practices, component organization, and automation techniques.",
      details: [
        "🎨 Hands-on design exercises",
        "📚 Resource materials provided",
        "🏆 Certificate of completion",
        "🤝 Networking session",
      ],
    },
  },
  {
    eventLogo: {
      src: "/react.svg",
      alt: "React Meetup Poster",
    },
    host: {
      logo: "/react.svg",
      name: "ReactJS Malaysia",
    },
    title: "React 19 Features Deep Dive",
    href: "/",
    tags: [
      { label: "Development", color: "bg-blue-100" },
      { label: "Frontend", color: "bg-green-200" },
    ],
    date: {
      fullDate: "25 March 2024",
      time: "7:00 PM - 9:00 PM",
    },
    location: "Mindvalley Hall, Kuala Lumpur",
    description: {
      preview:
        "Deep dive into React 19's new features including server components, suspense patterns, and the new hooks. Live coding demos and Q&A session included!",
      details: [
        "💻 Live coding demonstrations",
        "🔥 Hot topics discussion",
        "🍕 Pizza and refreshments",
        "🎁 Special door gifts",
      ],
    },
  },
];

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
            eventLogo={event.eventLogo}
            host={event.host}
            title={event.title}
            href={event.href}
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
