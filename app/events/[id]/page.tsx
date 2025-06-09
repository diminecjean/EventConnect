"use client";
import React, { use, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, notFound } from "next/navigation";
import type { Event } from "../../typings/events/typings";
import {
  ArrowRightFromLineIcon,
  CalendarDays,
  Check,
  Copy,
  FileSymlink,
  FileText,
  LinkIcon,
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
import {
  OrganizationProfile,
  UserProfile,
} from "@/app/typings/profile/typings";
import { Badge } from "@/components/badge/typings";
import BadgeClaimDialog from "@/components/badge/BadgeClaimDialog";

// Note:
// This hook fetches data in a more efficient way by caching the results,
// separating this out for better organization.
// Solves the issue of re-rendering every single fucking time
// TODO: move this into a separate file
function useEventData(
  id: string,
  user: UserProfile | null,
  organizations: OrganizationProfile[] | null,
) {
  const [event, setEvent] = useState<Event | null>(null);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formattedDateTime, setFormattedDateTime] = useState({
    date: "",
    time: "",
  });
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationLink, setRegistrationLink] = useState("");
  const [canEditOrg, setCanEditOrg] = useState(false);
  const [badge, setBadge] = useState<Badge | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);

  // Cache the fetch results in ref to persist between renders
  const dataCache = React.useRef({
    event: null as Event | null,
    orgName: null as string | null,
    formattedDateTime: { date: "", time: "" },
    isRegistered: false,
    registrationLink: "",
  });

  // Define the badge eligibility function outside the fetchEventData
  const checkBadgeEligibility = useCallback(async () => {
    if (!user || !event) return;

    try {
      // Check if event has ended
      const eventEnded = new Date(event.endDate) < new Date();
      console.log("Event ended:", eventEnded);
      if (!eventEnded) return;

      // Define user role - could be registered participant, organizer, or speaker
      let userRole = "NONE";

      // Check if user is registered
      if (isRegistered) {
        userRole = "PARTICIPANT";
      }

      // Check if user is an organizer
      // NOTE: not available yet
      const isOrganizer = canEditOrg;
      if (isOrganizer) {
        userRole = "ORGANIZER";
      }

      // Check if user is a speaker (if event has speakers array)
      const isSpeaker =
        event.speakers &&
        event.speakers.some((speaker) => speaker.name === user.name);
      if (isSpeaker) {
        userRole = "SPEAKER";
      }

      // If user has no role in this event, they're not eligible
      if (userRole === "NONE") return;

      // For participants, check if they were checked in
      let isEligible = false;
      if (userRole === "participant") {
        const regCheckResponse = await fetch(
          `${BASE_URL}/api/events/${id}/attendees/${user._id}/checkin`,
        );

        console.log("Registration check response:", regCheckResponse);

        if (regCheckResponse.ok) {
          const checkData = await regCheckResponse.json();
          console.log("Check data:", checkData);
          isEligible = checkData.checkedIn;
        }
      } else {
        // Organizers and speakers are automatically eligible
        isEligible = true;
      }

      if (!isEligible) return;

      // User is eligible, check if they already claimed the badge
      const badgeResponse = await fetch(
        `${BASE_URL}/api/badges?eventId=${id}&userId=${user._id}`,
      );

      console.log("Badge response:", badgeResponse);

      if (!badgeResponse.ok) return;

      const badgeData = await badgeResponse.json();

      console.log("Badge data:", badgeData);

      // If there's a badge for this event and it's not claimed, show the dialog
      if (badgeData.badges && badgeData.badges.length > 0) {
        // Look for the appropriate badge type based on user role
        const eventBadge = badgeData.badges.find(
          (b: any) => b.type === userRole,
        );
        console.log("Event badge:", { userRole, eventBadge });

        if (eventBadge && !eventBadge.claimed) {
          console.log("User is eligible for badge:", eventBadge);
          setBadge(eventBadge);
          setShowBadgeDialog(true);
        }
      }
    } catch (error) {
      console.error("Error checking badge eligibility:", error);
    }
  }, [id, user, event, isRegistered, canEditOrg]);

  const fetchEventData = useCallback(async () => {
    try {
      // Start with loading state, but show cached data if available
      setIsLoading(true);

      if (dataCache.current.event) {
        // Immediately show cached data
        setEvent(dataCache.current.event);
        setOrgName(dataCache.current.orgName);
        setFormattedDateTime(dataCache.current.formattedDateTime);
        setIsRegistered(dataCache.current.isRegistered);
        setRegistrationLink(dataCache.current.registrationLink);

        // Slight delay to ensure UI updates before potentially showing loading again
        await new Promise((r) => setTimeout(r, 10));
      }

      // Fetch new data in the background
      const response = await fetch(`${BASE_URL}/api/events/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch event data");
      }

      const res = await response.json();
      setEvent(res.event);
      dataCache.current.event = res.event;

      // Fetch organization data
      const orgResponse = await fetch(
        `${BASE_URL}/api/organizations/${res.event.organizationId}`,
      );
      if (!orgResponse.ok) {
        throw new Error("Failed to fetch organization data");
      }
      const orgData = await orgResponse.json();
      setOrgName(orgData.organization.name);
      dataCache.current.orgName = orgData.organization.name;

      // Format date time
      if (res.event?.startDate && res.event?.endDate) {
        const dateTime = formatEventDateTime(
          res.event.startDate,
          res.event.endDate,
        );
        setFormattedDateTime(dateTime);
        dataCache.current.formattedDateTime = dateTime;
      }

      // Check registration status
      if (user && user._id) {
        const regCheckResponse = await fetch(
          `${BASE_URL}/api/events/${id}/register?userId=${user._id}`,
        );
        if (regCheckResponse.ok) {
          const regData = await regCheckResponse.json();
          setIsRegistered(regData.isRegistered);
          dataCache.current.isRegistered = regData.isRegistered;

          if (regData.registrationId) {
            const link = `${window.location.origin}/events/${id}/registration/${regData.registrationId}`;
            setRegistrationLink(link);
            dataCache.current.registrationLink = link;
          }
        }
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  // Effect for checking badge eligibility
  useEffect(() => {
    console.log({ event, user, isRegistered });
    if (event && user) {
      console.log("Checking badge eligibility...");
      checkBadgeEligibility();
    }
  }, [event, user, isRegistered, checkBadgeEligibility]);

  // Check if user can edit org
  useEffect(() => {
    if (organizations && event?.organizationId) {
      // Check if this organization ID is in the user's organizations list
      const userCanEdit = organizations.some(
        (org: any) => org._id === event.organizationId,
      );
      setCanEditOrg(userCanEdit);
    }
  }, [user, event]);

  useEffect(() => {
    fetchEventData();
  }, [fetchEventData]);

  return {
    event,
    orgName,
    isLoading,
    formattedDateTime,
    isRegistered,
    registrationLink,
    canEditOrg,
    badge,
    showBadgeDialog,
    setShowBadgeDialog,
    checkBadgeEligibility,
  };
}

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
  isOrganizer,
  isRegistered,
}: {
  event: Event;
  isOrganizer: boolean;
  isRegistered: boolean;
}) => {
  const router = useRouter();
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

            {/* Gallery Images - Visible to everyone */}
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">Event Gallery</h2>
              {event.materials?.galleryImages &&
              event.materials.galleryImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.materials.galleryImages.map((imageUrl, index) => (
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
                <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 italic">
                    No gallery images available for this event yet.
                  </p>
                </div>
              )}
            </div>

            {/* Event Materials - Access controlled */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h2 className="text-lg font-medium mb-4">Event Materials</h2>

              {isOrganizer || isRegistered ? (
                <div className="space-y-8">
                  {/* Downloadable Materials */}
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-blue-400 mb-2">
                      Downloadable Resources
                    </h3>
                    {event.materials?.uploads &&
                    event.materials.uploads.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {event.materials.uploads.map((file, index) => {
                          const fileName = file.name;
                          const fileUrl = file.url.toString();
                          const fileExtension = fileUrl
                            ? fileUrl.split(".").pop()?.toLowerCase()
                            : "";

                          let fileIcon;
                          let iconColor;

                          // Set icon based on file extension
                          switch (fileExtension) {
                            case "pdf":
                              fileIcon = (
                                <svg
                                  className="h-8 w-8"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M7 18H17V16H7V18Z" />
                                  <path d="M17 14H7V12H17V14Z" />
                                  <path d="M7 10H11V8H7V10Z" />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
                                  />
                                </svg>
                              );
                              iconColor = "text-red-500";
                              break;
                            case "doc":
                            case "docx":
                              fileIcon = (
                                <svg
                                  className="h-8 w-8"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M7 18H17V16H7V18Z" />
                                  <path d="M17 14H7V12H17V14Z" />
                                  <path d="M7 10H11V8H7V10Z" />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
                                  />
                                </svg>
                              );
                              iconColor = "text-blue-500";
                              break;
                            case "ppt":
                            case "pptx":
                              fileIcon = (
                                <svg
                                  className="h-8 w-8"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M7 18H17V16H7V18Z" />
                                  <path d="M17 14H7V12H17V14Z" />
                                  <path d="M7 10H11V8H7V10Z" />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
                                  />
                                </svg>
                              );
                              iconColor = "text-orange-500";
                              break;
                            case "xls":
                            case "xlsx":
                            case "csv":
                              fileIcon = (
                                <svg
                                  className="h-8 w-8"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                >
                                  <path d="M7 18H17V16H7V18Z" />
                                  <path d="M17 14H7V12H17V14Z" />
                                  <path d="M7 10H11V8H7V10Z" />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z"
                                  />
                                </svg>
                              );
                              iconColor = "text-green-500";
                              break;
                            default:
                              fileIcon = <FileText className="h-8 w-8" />;
                              iconColor = "text-gray-400";
                          }

                          return (
                            <a
                              key={index}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-4 bg-gray-800 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all"
                            >
                              <div
                                className={`flex-shrink-0 mr-3 ${iconColor}`}
                              >
                                {fileIcon}
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium text-sm truncate">
                                  {fileName}
                                </p>
                                <p className="text-xs text-gray-400">
                                  Click to download
                                </p>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <FileSymlink className="h-5 w-5" />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No downloadable materials available yet.
                      </p>
                    )}
                  </div>

                  {/* External Links */}
                  <div>
                    <h3 className="text-md font-medium text-violet-400 mb-2">
                      External Resources
                    </h3>
                    {event.materials?.urls &&
                    event.materials.urls.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {event.materials.urls.map((linkEntry, index) => {
                          // Extract title and URL if in "title|url" format
                          let title, url;

                          if (linkEntry.includes("|")) {
                            [title, url] = linkEntry.split("|");
                          } else {
                            url = linkEntry;
                            try {
                              title = new URL(url).hostname.replace("www.", "");
                            } catch (e) {
                              title = url;
                            }
                          }

                          return (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-4 bg-gray-800 bg-opacity-40 rounded-lg hover:bg-opacity-60 transition-all"
                            >
                              <div className="flex-shrink-0 mr-3 text-violet-400">
                                <LinkIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium text-sm truncate">
                                  {title}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {url}
                                </p>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <FileSymlink className="h-4 w-4" />
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No external resources available yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-lg border border-gray-600">
                  {/* Blurred background with event materials preview */}
                  <div className="absolute inset-0 bg-gray-800 bg-opacity-20 backdrop-blur-md flex items-center justify-center">
                    <div className="absolute inset-0 flex">
                      <div className="h-full w-1/2 border-r border-gray-500 border-dashed flex items-center justify-center opacity-30">
                        <FileText className="h-12 w-12" />
                      </div>
                      <div className="h-full w-1/2 flex items-center justify-center opacity-30">
                        <LinkIcon className="h-12 w-12" />
                      </div>
                    </div>
                  </div>

                  {/* Registration message */}
                  <div className="relative py-12 px-6 backdrop-filter backdrop-blur-sm bg-black bg-opacity-60 rounded-lg max-w-lg mx-auto text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      Access to Event Materials
                    </h3>
                    <p className="mb-6">
                      Event materials are exclusively available to registered
                      attendees. Register for future events to access
                      presentations, resources, and other materials shared by
                      organizers.
                    </p>
                    <div className="space-x-4">
                      <Button
                        onClick={() =>
                          router.push(
                            `/events/${event._id.toString()}/register`,
                          )
                        }
                        className="bg-violet-700 hover:bg-violet-800"
                      >
                        Register for this Event
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/profile/organization/${event.organizationId}`,
                          )
                        }
                      >
                        Visit Organizer Page
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
  const { user, organizations } = useAuth();

  const {
    event,
    orgName,
    isLoading,
    formattedDateTime,
    isRegistered,
    registrationLink,
    canEditOrg,
    badge,
    showBadgeDialog,
    setShowBadgeDialog,
    checkBadgeEligibility,
  } = useEventData(id, user, organizations);

  const [isCopied, setIsCopied] = useState(false);

  // Rest of your component remains the same
  if (isLoading && !event) {
    // Only show skeleton if we have no event data yet
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
              ) : new Date(event.endDate) < new Date() ? (
                <Button
                  disabled
                  className="bg-gray-600 w-full text-white rounded-lg cursor-not-allowed"
                >
                  Event has passed
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
              ) : user ? (
                <Button
                  onClick={() =>
                    router.push(`/events/${event._id.toString()}/register`)
                  }
                  className="bg-violet-900 w-full text-white rounded-lg"
                >
                  Register
                </Button>
              ) : (
                <Button
                  disabled
                  className="bg-violet-900 w-full text-white rounded-lg"
                >
                  Login or Create an Account to Register
                </Button>
              )}
            </div>
            <EventTabs
              event={event}
              isRegistered={isRegistered}
              isOrganizer={canEditOrg}
            />
            {badge && (
              <BadgeClaimDialog
                open={showBadgeDialog}
                onOpenChange={setShowBadgeDialog}
                badge={badge}
                userId={user?._id || ""}
                eventId={id}
                onClaim={checkBadgeEligibility}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
