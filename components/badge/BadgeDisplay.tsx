import React from "react";
import Image from "next/image";
import { Badge } from "./typings";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  claimed?: boolean;
  variant?: "default" | "badge-only";
}

const getDefaultBadgeImage = (badgeType: Badge["type"]) => {
  // Normalize the badge type to handle different case formats
  const type = badgeType?.toUpperCase() || "";

  switch (type) {
    case "PARTICIPANT":
      return "https://dpxvvqkjcqorqqkkamxa.supabase.co/storage/v1/object/public/badges//participant.png";
    case "SPEAKER":
      return "https://dpxvvqkjcqorqqkkamxa.supabase.co/storage/v1/object/public/badges//speaker.png";
    case "SPONSOR":
      return "https://dpxvvqkjcqorqqkkamxa.supabase.co/storage/v1/object/public/badges//sponsor.png";
    case "VOLUNTEER":
      return "/badges/volunteer.png";
    case "ORGANIZER":
      return "/badges/organizer.png";
    default:
      return "https://dpxvvqkjcqorqqkkamxa.supabase.co/storage/v1/object/public/badges//custom.png";
  }
};

const getDefaultDescription = (badgeType: Badge["type"]) => {
  const type = badgeType?.toLowerCase() || "";

  switch (type) {
    case "participant":
      return "Awarded for attending and participating in the event";
    case "speaker":
      return "Awarded for presenting or speaking at the event";
    case "sponsor":
      return "Awarded for sponsoring the event";
    case "volunteer":
      return "Awarded for volunteering and helping at the event";
    case "organizer":
      return "Awarded for organizing the event";
    default:
      return "Special achievement badge";
  }
};

export default function BadgeDisplay({
  badge,
  size = "md",
  claimed = false,
  variant = "default",
}: BadgeDisplayProps) {
  const sizes = {
    sm: { width: 60, height: 60, className: "text-xs" },
    md: { width: 100, height: 100, className: "text-sm" },
    lg: { width: 150, height: 150, className: "text-base" },
  };

  const { width, height, className } = sizes[size];
  const badgeType = badge.type || badge.type;
  const defaultImageUrl = getDefaultBadgeImage(badgeType);

  // Use badge description if available, otherwise use default description
  const description = badge.description || getDefaultDescription(badgeType);

  const badgeContent =
    variant === "badge-only" ? (
      <div className="flex items-center justify-center">
        {badge.imageUrl ? (
          <Image
            src={badge.imageUrl}
            alt={badge.name}
            width={width}
            height={height}
            className="rounded-full object-cover border-2 border-violet-200"
          />
        ) : defaultImageUrl ? (
          <Image
            src={defaultImageUrl}
            alt={badge.name || badge.type}
            width={width}
            height={height}
            className="rounded-full object-cover border-2 border-violet-200"
          />
        ) : (
          <div
            className={`bg-violet-700 flex items-center justify-center rounded-md text-white`}
            style={{ width, height }}
          >
            <span className="font-medium">
              {badge.name?.substring(0, 2) ||
                badge.type?.substring(0, 2) ||
                "BD"}
            </span>
          </div>
        )}
      </div>
    ) : (
      <Card
        className={`overflow-hidden relative ${claimed ? "border-2 border-violet-500" : ""}`}
      >
        <CardContent className="p-4 flex flex-col items-center">
          <div className="relative">
            {badge.imageUrl ? (
              <Image
                src={badge.imageUrl}
                alt={badge.name}
                width={width}
                height={height}
                className="rounded-md object-cover"
              />
            ) : defaultImageUrl ? (
              <Image
                src={defaultImageUrl}
                alt={badge.name || badge.type}
                width={width}
                height={height}
                className="rounded-md object-cover"
              />
            ) : (
              <div
                className={`bg-violet-700 flex items-center justify-center rounded-md text-white`}
                style={{ width, height }}
              >
                <span className="font-medium">
                  {badge.name?.substring(0, 2) ||
                    badge.type?.substring(0, 2) ||
                    "BD"}
                </span>
              </div>
            )}
            {claimed && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1 w-6 h-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </div>
          <h3 className={`mt-2 font-medium text-center ${className}`}>
            {badge.name ||
              (badge.type &&
                `${badge.type.charAt(0).toUpperCase()}${badge.type.slice(1)} Badge`)}
          </h3>
        </CardContent>
      </Card>
    );

  // Wrap with tooltip if description is available
  return description ? (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent className="p-3">
          <p>{description}</p>
          {/* {badge.eventName && (
            <p className="text-xs text-gray-500 mt-1">From: {badge.eventName}</p>
          )}
          {badge.claimedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Earned: {new Date(badge.claimedAt).toLocaleDateString()}
            </p>
          )} */}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    badgeContent
  );
}
