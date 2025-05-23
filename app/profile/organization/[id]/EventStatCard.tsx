import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import EventStats from "./EventStats";
import { Event } from "@/app/typings/events/typings";

interface EventStatCardProps {
  event: Event & { registrationCount?: number };
}

const EventStatCard: React.FC<EventStatCardProps> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Format date for display
  const formattedDate = event.startDate
    ? format(new Date(event.startDate), "MMM dd, yyyy")
    : "Date TBD";

  return (
    <div className="flex flex-col justify-center border rounded-lg overflow-hidden bg-black/70">
      {/* Card Header - Always visible */}
      <div
        className="flex items-center cursor-pointer p-4 hover:bg-violet-400/10"
        onClick={toggleExpand}
      >
        <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 mr-4">
          <Image
            src={event.imageUrl || "/default-event-image.jpg"}
            alt={event.title}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          <h3 className="font-medium text-lg">{event.title}</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mt-1">
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {formattedDate}
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {event.location}
              </div>
            )}
            {event.registrationCount !== undefined && (
              <div className="flex items-center">
                <Users size={14} className="mr-1" />
                {event.registrationCount} registered
              </div>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="ml-2"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Button>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t p-4 bg-black/70">
          <EventStats eventId={event._id} />
        </div>
      )}
    </div>
  );
};

export default EventStatCard;
