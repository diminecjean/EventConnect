import Image from "next/image";
import { notFound } from "next/navigation";
import eventsData from "@/data/eventsData.json";
import type { Event } from "../../../typings/events/typings";
import { CalendarDays, LucideGlobe, MapPin } from "lucide-react";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Twitter, Github } from "lucide-react"; // Import icons
import EventImage from "@/app/events/EventImage"; // Import the new client component

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

const SampleEventPage = ({ event }: { event: Event }) => {
  return (
    <main className="">
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
};

const speakers = [
  {
    name: "Jane Doe",
    role: "Software Engineer at Google",
    bio: "Passionate about AI and open-source technologies.",
    image: "",
    social: [
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/janedoe",
      },
      {
        platform: "Twitter",
        url: "https://twitter.com/janedoe",
      },
    ],
  },
  {
    name: "John Smith",
    role: "CTO at StartupX",
    bio: "Tech entrepreneur and advocate for cloud computing.",
    image: "",
    social: [
      {
        platform: "GitHub",
        url: "https://github.com/johnsmith",
      },
      {
        platform: "LinkedIn",
        url: "https://linkedin.com/in/johnsmith",
      },
    ],
  },
  {
    name: "Emily Chen",
    role: "Data Scientist at Meta",
    bio: "Exploring the intersection of data and ethics.",
    image: "",
    social: [
      {
        platform: "Linkedin",
        url: "https://linkedin.com/@emilychen",
      },
    ],
  },
];

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin />;
    case "twitter":
      return <Twitter />;
    case "github":
      return <Github />;
    default:
      return <LucideGlobe />;
  }
};

const TabsDemo = () => {
  return (
    <Tabs defaultValue="timeline" className="my-6 w-full min-w-xl">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="speakers">Speakers</TabsTrigger>
        <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
        <TabsTrigger value="pictures">Pictures</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">
        <div>
          <h1 className="font-semibold text-xl my-4">Event Schedule</h1>
          <Timeline>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <TimelineTitle>Eat</TimelineTitle>
                <TimelineDescription>
                  Because you need strength
                </TimelineDescription>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <TimelineTitle>Code</TimelineTitle>
                <TimelineDescription>Because it's awesome!</TimelineDescription>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
                <TimelineConnector />
              </TimelineSeparator>
              <TimelineContent>
                <TimelineTitle>Sleep</TimelineTitle>
                <TimelineDescription>Because you need rest</TimelineDescription>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineSeparator>
                <TimelineDot />
              </TimelineSeparator>
              <TimelineContent>
                <TimelineTitle>Repeat</TimelineTitle>
                <TimelineDescription>
                  Because this is the life you love!
                </TimelineDescription>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>
      </TabsContent>
      <TabsContent value="speakers">
        <div>
          <h1 className="font-semibold text-xl my-4">Speakers</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speakers?.map((speaker, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-clip max-w-xl p-4 hover:bg-white hover:bg-opacity-10 border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full"
              >
                <div className="flex flex-col items-center flex-grow">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3">
                    {speaker.image ? (
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-violet-200 text-violet-700 text-xl font-bold">
                        {speaker.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg">{speaker.name}</h3>
                  <p className="text-sm text-violet-600 mb-2">{speaker.role}</p>
                  <p className="text-sm text-center text-gray-600">
                    {speaker.bio}
                  </p>
                </div>
                {speaker.social && (
                  <div className="flex gap-3 mt-3">
                    {speaker.social.map((link, i) => (
                      <a
                        key={i}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-violet-700"
                      >
                        {getSocialIcon(link.platform)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent value="sponsors">
        <div>
          <h1 className="font-semibold text-xl my-4">Sponsors</h1>
        </div>
      </TabsContent>
      <TabsContent value="pictures">
        <div>
          <h1 className="font-semibold text-xl my-4">Pictures</h1>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) return notFound();

  return (
    <div className="w-full mt-20 flex flex-col gap-4">
      <div className="w-full bg-violet-800 h-64 rounded-lg"></div>
      <div className="flex flex-row gap-6 items-start">
        {/* Event details left col*/}
        <div className="flex flex-col gap-4 border-white border-2 p-4 rounded-lg">
          <EventImage
            src={event.eventLogo.src}
            alt={event.title}
            title={event.title}
          />
          {/* Date time location */}
          <div className="flex flex-col gap-6 p-2 justify-start">
            <div className="flex flex-row gap-6 max-w-64 items-center">
              <div>
                <CalendarDays size={24} />
              </div>
              <div className="flex flex-col items-start">
                <div className="font-medium text-sm">{event.date.fullDate}</div>
                <div className="font-light text-sm">{event.date.time}</div>
              </div>
            </div>
            <div className="flex flex-row gap-6 max-w-64 items-center">
              <div>
                <MapPin size={24} />
              </div>
              <div className="flex flex-col font-normal text-sm items-center">
                {event.location}
              </div>
            </div>
          </div>
          <div className="flex bg-violet-700 h-64 w-64 rounded-lg items-center justify-center">
            Location map
          </div>
          {/* Attendee details */}
          <div></div>
          {/* TODO: add button for registration */}
          <div className="flex w-full justify-center">
            <button className="bg-violet-700 w-full text-white rounded-lg p-2">
              Register
            </button>
          </div>
        </div>
        {/* Event details right col*/}
        <div className="flex flex-col items-start p-4">
          <h1 className="text-4xl font-semibold">{event.title}</h1>
          <p className="mt-4">{event.description.preview}</p>
          <ul className="mt-4 list-disc list-inside">
            {event.description.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
          <TabsDemo />
        </div>
      </div>
    </div>
  );
}
