"use client";

import * as React from "react";
import Image from "next/image";
import { CalendarDays, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BASE_URL } from "../api/constants";
import { OrganizationProfile } from "../typings/profile/typings";

// Types for the component props
type Tag = {
  label: string;
  color: string;
};

type EventCardProps = {
  id: string;
  eventLogo: { src: string; alt: string; width: number; height: number };
  organizationId: string;
  title: string;
  tags: Tag[];
  date: { startDate: Date; endDate: Date };
  location: string;
  description: string;
};

// const tags = [
//   { label: "Web Dev", color: "bg-blue-100" },
//   { label: "AI", color: "bg-purple-100" },
//   { label: "Cloud", color: "bg-green-100" },
//   { label: "DevOps", color: "bg-yellow-100" },
//   { label: "Mobile", color: "bg-orange-100" },
// ];

/**
 * Formats event dates and times for display
 * @param startDate - Event start date (MongoDB format or Date object)
 * @param endDate - Event end date (MongoDB format or Date object)
 * @returns Object with formatted date and time strings
 */
export const formatEventDateTime = (
  startDate: Date | string | { $date: string },
  endDate: Date | string | { $date: string },
) => {
  console.log({ startDate, endDate });

  // Handle MongoDB date format ($date property)
  const startDateValue =
    startDate && typeof startDate === "object" && "$date" in startDate
      ? startDate.$date
      : startDate;

  const endDateValue =
    endDate && typeof endDate === "object" && "$date" in endDate
      ? endDate.$date
      : endDate;

  // Convert to Date objects
  const start =
    startDateValue instanceof Date ? startDateValue : new Date(startDateValue);
  const end =
    endDateValue instanceof Date ? endDateValue : new Date(endDateValue);

  // Rest of the function stays the same
  // Format the dates
  const startDateFormatted = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const endDateFormatted = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Format the times
  const startTimeFormatted = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const endTimeFormatted = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  // Check if same day (compare year, month, and day)
  const isSameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  // Return formatted strings based on whether it's same day or multi-day
  return {
    date: isSameDay
      ? startDateFormatted
      : `${startDateFormatted} - ${endDateFormatted}`,
    time: `${startTimeFormatted} - ${endTimeFormatted}`,
  };
};

export default function EventCard({
  id,
  eventLogo,
  organizationId,
  title,
  tags,
  date,
  location,
  description,
}: EventCardProps) {
  const [isExpandDesc, setIsExpandDesc] = React.useState(false);
  const [host, setHost] = React.useState<OrganizationProfile | null>(null);

  // Format the date and time
  const formattedDateTime = React.useMemo(() => {
    console.log({ date });
    return formatEventDateTime(date.startDate, date.endDate);
  }, [date.startDate, date.endDate]);

  React.useEffect(() => {
    async function fetchOrganization(id: string) {
      try {
        // Change this to organizationId when ready
        const response = await fetch(`${BASE_URL}/api/organizations/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch organization data");
        }
        const res = await response.json();
        setHost(res.organization);
      } catch (error) {
        console.error("Error fetching organization ID:", error);
      }
    }

    fetchOrganization(organizationId);
  }, []);

  return (
    <Card>
      <div className="flex flex-col justify-center items-center md:flex-row md:items-start md:justify-between p-4">
        <div className="flex flex-col space-y-1.5 w-2/7 gap-2 items-center">
          <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden">
            <Image
              className="object-cover dark:drop-shadow-[0_0_0.3rem_#ffffff70] saturate-0 brightness-0 dark:saturate-100 dark:brightness-100"
              src={eventLogo.src}
              alt={eventLogo.alt}
              fill
              sizes="(max-width: 768px) 100vw, 200px"
              priority
            />
          </div>
          {host && (
            <a href={`/profile/organization/${host._id}`}>
              <div className="flex flex-row border rounded-lg border-gray-300 p-2 gap-1 items-center justify-center md:justify-start">
                <div>
                  <Image
                    className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] saturate-0 brightness-0 dark:saturate-100 dark:brightness-100"
                    src={host.logo}
                    alt={`${host.name} Logo`}
                    width={32}
                    height={24}
                  />
                </div>
                <div className="flex flex-col pl-1 items-start">
                  <div className="text-xs font-light">Hosted by</div>
                  <div className="text-xs font-medium line-clamp-1">
                    {host.name}
                  </div>
                </div>
              </div>
            </a>
          )}
        </div>
        <div className="flex flex-col space-y-1 py-6 md:py-0 items-start w-5/7">
          <CardHeader>
            <CardTitle>
              <a href={`/events/${id}`} className="hover:underline">
                {title}
              </a>
            </CardTitle>
            <div className="flex flex-row space-x-2 justify-start">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className={`px-2 ${typeof tag === "object" ? tag.color : "bg-gray-100"} rounded-md`}
                >
                  <span className="text-xs text-gray-800">
                    {typeof tag === "object" ? tag.label : tag}
                  </span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 my-4 items-start">
              <div className="flex flex-row gap-2 max-w-64 items-center">
                <div>
                  <CalendarDays size={24} />
                </div>
                <div className="flex flex-col items-start">
                  <div className="font-medium text-xs">
                    {formattedDateTime.date}
                  </div>
                  <div className="font-light text-xs">
                    {formattedDateTime.time}
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-2 max-w-64 items-center">
                <div>
                  <MapPin size={24} />
                </div>
                <div className="flex flex-col font-normal text-xs items-start">
                  {location}
                </div>
              </div>
            </div>
            <Collapsible
              open={isExpandDesc}
              onOpenChange={setIsExpandDesc}
              className="w-full max-w-4xl space-y-2 bg-gray-100 bg-opacity-10 rounded-md p-4"
            >
              <div className="flex items-start justify-between space-x-4">
                <h4
                  className={`text-xs text-gray-700 dark:text-gray-200 ${!isExpandDesc ? "line-clamp-2" : ""}`}
                  ref={(el) => {
                    // This checks if the text needs truncation
                    if (el) {
                      const hasOverflow =
                        el.scrollHeight > el.clientHeight * 1.1;
                      if (hasOverflow) {
                        el.dataset.truncated = "true";
                      } else {
                        el.dataset.truncated = "false";
                      }
                    }
                  }}
                >
                  {description}
                </h4>
                <CollapsibleTrigger
                  className="p-1 flex-shrink-0"
                  data-testid="collapsible-trigger"
                >
                  {isExpandDesc ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="text-xs text-gray-700 dark:text-gray-200 pt-2">
                {/* No need to repeat the full text, just show a separator */}
                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                {/* The rest of the description is already visible since line-clamp is removed */}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
