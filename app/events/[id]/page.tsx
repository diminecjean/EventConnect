"use client";
import React, { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import type { Event } from "../../typings/events/typings";
import {
  ArrowRightFromLineIcon,
  CalendarDays,
  Check,
  Copy,
  LucideGlobe,
  MapPin,
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Twitter, Github, Instagram } from "lucide-react"; // Import icons
import EventImage from "@/app/events/EventImage"; // Import the new client component
import { BASE_URL } from "@/app/api/constants";
import { formatEventDateTime } from "@/app/utils/formatDate";
import GoogleMap from "@/components/GoogleMap";
import { useAuth } from "@/app/context/authContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RegisteredParticipantsCount from "./RegisteredParticipantsCount";
import { SkeletonEvent } from "@/components/ui/skeleton";

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "linkedin":
      return <Linkedin />;
    case "twitter":
      return <Twitter />;
    case "github":
      return <Github />;
    case "instagram":
      return <Instagram />;
    default:
      return <LucideGlobe />;
  }
};

const EventTabs = ({
  event,
  isRegistered,
}: {
  event: Event;
  isRegistered: boolean;
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Function to open the lightbox
  const openLightbox = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Function to close the lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };
  return (
    <>
      <Tabs defaultValue="timeline" className="my-6 w-full min-w-xl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="speakers">Speakers</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <div>
            <h1 className="font-semibold text-xl my-4">Event Schedule</h1>
            {event.timelineItems && event.timelineItems.length > 0 ? (
              <Timeline>
                {event.timelineItems.map((item, index) => {
                  const isLast = index === event.timelineItems.length - 1;
                  return (
                    <TimelineItem key={item.id}>
                      <TimelineSeparator>
                        <TimelineDot />
                        {!isLast && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <TimelineTitle>
                          {item.time} - {item.title}
                        </TimelineTitle>
                        <TimelineDescription>
                          {item.description}
                        </TimelineDescription>
                      </TimelineContent>
                    </TimelineItem>
                  );
                })}
              </Timeline>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <p className="text-gray-500 italic">
                  No schedule information available at the moment.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="speakers">
          <div>
            <h1 className="font-semibold text-xl my-4">Speakers</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {event.speakers && event.speakers.length > 0 ? (
                event.speakers?.map((speaker, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center text-clip max-w-xl p-4 hover:bg-white hover:bg-opacity-10 border rounded-lg shadow-sm hover:shadow-md transition-shadow h-full"
                  >
                    <div className="flex flex-col items-center flex-grow">
                      <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3">
                        {speaker.imageUrl ? (
                          <img
                            src={speaker.imageUrl}
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
                      <p className="text-sm text-violet-600 mb-2">
                        {speaker.position}
                        {speaker.organization
                          ? ` in ${speaker.organization}`
                          : ""}
                      </p>
                      {speaker.introduction ?? (
                        <p className="text-sm text-center text-gray-600">
                          {speaker.introduction}
                        </p>
                      )}
                    </div>
                    {speaker.socialMedia && (
                      <div className="flex gap-3 mt-3">
                        {speaker.socialMedia.map((link, id) => (
                          <a
                            key={id}
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
                ))
              ) : (
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 italic">
                    No speakers available for this event yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="sponsors">
          <div>
            <h1 className="font-semibold text-xl my-4">Sponsors</h1>

            {event.sponsors && event.sponsors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {event.sponsors.map((sponsor) => (
                  <div
                    key={sponsor.id}
                    className="border rounded-lg p-2 flex flex-col items-center shadow-sm hover:shadow-md transition-shadow h-full"
                  >
                    {/* Sponsor type badge */}
                    <div className="self-center mb-2">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium capitalize
                          ${
                            sponsor.sponsorType === "platinum"
                              ? "bg-slate-300 text-slate-800"
                              : sponsor.sponsorType === "gold"
                                ? "bg-yellow-100 text-yellow-800"
                                : sponsor.sponsorType === "silver"
                                  ? "bg-gray-100 text-gray-800"
                                  : sponsor.sponsorType === "food"
                                    ? "bg-green-100 text-green-800"
                                    : sponsor.sponsorType === "venue"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-violet-100 text-violet-800"
                          }`}
                      >
                        {sponsor.sponsorType}
                      </span>
                    </div>

                    <div className="relative w-full h-36 mb-4">
                      {sponsor.logoUrl ? (
                        <Image
                          src={sponsor.logoUrl}
                          alt={`${sponsor.name} logo`}
                          fill
                          className="object-contain dark:drop-shadow-[0_0_0.3rem_#ffffff70] p-2"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-md">
                          <span className="text-lg font-semibold text-gray-500">
                            {sponsor.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">
                      {sponsor.name}
                    </h3>

                    {sponsor.description && (
                      <p className="text-sm text-gray-400 text-center mb-4">
                        {sponsor.description}
                      </p>
                    )}

                    {sponsor.socialLinks && sponsor.socialLinks.length > 0 && (
                      <div className="flex gap-3 mt-auto">
                        {sponsor.socialLinks.map((link, idx) => (
                          <a
                            key={idx}
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 italic">
                    No sponsors available for this event yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="materials">
          <div>
            <h1 className="font-semibold text-xl my-4">
              Event Gallery & Materials
            </h1>

            <>
              {event.galleryImages && event.galleryImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.galleryImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => openLightbox(imageUrl)}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Event image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 italic">
                      No materials available for this event yet.
                    </p>
                  </div>
                </div>
              )}
            </>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full h-[80vh] bg-transparent">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full px-4 py-3 text-white text-sm"
              >
                ✕
              </button>
            </div>
            <div className="relative w-full h-full">
              <Image
                src={selectedImage}
                alt="Enlarged event image"
                className="object-contain"
                fill
                sizes="100vw"
                onClick={(e) => e.stopPropagation()}
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const { user, organizations } = useAuth();
  const [canEditOrg, setCanEditOrg] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedDateTime, setFormattedDateTime] = useState({
    date: "",
    time: "",
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLink, setRegistrationLink] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        setIsLoading(true);
        const response = await fetch(`${BASE_URL}/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event data");
        }

        const res = await response.json();
        setEvent(res.event);

        // get org name
        const orgResponse = await fetch(
          `${BASE_URL}/api/organizations/${res.event.organizationId}`,
        );
        if (!orgResponse.ok) {
          throw new Error("Failed to fetch organization data");
        }
        const orgData = await orgResponse.json();
        setOrgName(orgData.organization.name);

        if (user && organizations) {
          // Check if this organization ID is in the user's organizations list
          const userCanEdit = organizations.some(
            (org) => org._id === res.event.organizationId,
          );
          setCanEditOrg(userCanEdit);
        }

        if (res.event?.startDate && res.event?.endDate) {
          const dateTime = formatEventDateTime(
            res.event.startDate,
            res.event.endDate,
          );
          setFormattedDateTime(dateTime);
        }

        if (user && user._id) {
          // Check if user is registered
          const regCheckResponse = await fetch(
            `${BASE_URL}/api/events/${id}/register?userId=${user._id}`,
          );
          if (regCheckResponse.ok) {
            const regData = await regCheckResponse.json();
            setIsRegistered(regData.isRegistered);
            if (regData.registrationId) {
              setRegistrationLink(
                `${window.location.origin}/events/${id}/registration/${regData.registrationId}`,
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching event ID:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEvent();
  }, [id, user]);

  if (isLoading) {
    return <SkeletonEvent />;
  }

  if (!event) {
    return notFound();
  }

  const copyRegistrationLink = () => {
    navigator.clipboard
      .writeText(registrationLink)
      .then(() => {
        setIsCopied(true);
        toast("Registration link copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast("Failed to copy link to clipboard");
      });
  };

  const handleEditEvent = () => {
    router.push(
      `/events/${event._id.toString()}/edit?orgId=${event.organizationId}&&eventName=${event.title}`,
    );
  };

  return (
    <div className="w-full mt-20 flex flex-col gap-4">
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
      <div className="flex flex-row gap-6 items-start">
        {/* Event details left col*/}
        <div className="flex flex-col gap-4 border-white border-2 p-4 rounded-lg">
          <EventImage
            src={event.imageUrl}
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
                <div className="font-semibold text-sm">
                  {formattedDateTime.date}
                </div>
                <div className="font-light text-sm">
                  {formattedDateTime.time}
                </div>
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
          <div className="relative aspect-square w-64 rounded-lg overflow-hidden">
            <GoogleMap
              location={event.location}
              height="100%"
              width="100%"
              // apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} // Use your API key if you have one
            />
          </div>
          {/* Attendee details */}
          <div></div>
          <div className="mt-4">
            <RegisteredParticipantsCount eventId={event._id.toString()} />
          </div>
        </div>
        {/* Event details right col*/}
        <div className="flex flex-row gap-4 w-full">
          <div className="flex flex-col items-start p-4">
            <div className="flex flex-row justify-between gap-4 w-full">
              <h1 className="text-4xl font-semibold">{event.title}</h1>
              {canEditOrg && (
                <Button
                  variant="outline_violet"
                  className="rounded-full text-violet-500 font-semibold"
                  onClick={handleEditEvent}
                >
                  Edit Event
                </Button>
              )}
            </div>
            <p className="flex flex-row items-center text-sm font-semibold text-gray-200 mt-2">
              <ArrowRightFromLineIcon className="pr-2" /> by{" "}
              <span
                className="hover:underline hover:text-violet-500 cursor-pointer ml-2"
                onClick={() => {
                  router.push(`/profile/organization/${event.organizationId}`);
                }}
              >
                {orgName}
              </span>
            </p>
            <p className="mt-4">{event.description}</p>
            {/* Button for registration */}
            <div className="flex w-full justify-center my-4">
              {canEditOrg ? (
                <Button
                  className="bg-violet-900 w-full text-white rounded-lg"
                  onClick={() =>
                    router.push(`/events/${event._id.toString()}/attendees`)
                  }
                >
                  View Attendees
                </Button>
              ) : isRegistered ? (
                <div className="flex flex-row w-full gap-2">
                  <button
                    disabled
                    className="flex justify-center items-center bg-green-700 w-full text-white rounded-lg"
                  >
                    <Check className="mr-2 h-4 w-4" /> Registered
                  </button>

                  <div className="flex items-center gap-2 border rounded-lg bg-violet-900 bg-opacity-10 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyRegistrationLink}
                      className="flex-grow"
                    >
                      {isCopied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" /> Copy Registration
                          Link
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() =>
                    router.push(`/events/${event._id.toString()}/register`)
                  }
                  className="bg-violet-900 w-full text-white rounded-lg"
                >
                  Register
                </Button>
              )}
            </div>
            <EventTabs event={event} isRegistered={isRegistered} />
          </div>
        </div>
      </div>
    </div>
  );
}
