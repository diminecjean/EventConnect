import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { formatEventDateTime } from "@/app/utils/formatDate";
import {
  getEventStatus,
  getEventStatusStyle,
} from "@/app/events/util/getEventStatus";
import { useRouter } from "next/navigation";
import { Event } from "@/app/typings/events/typings";
import Image from "next/image";
import { useEffect, useState } from "react";

const EventCard = ({ event }: { event: Event }) => {
  const [formattedDateTime, setFormattedDateTime] = useState({
    date: "",
    time: "",
  });
  const router = useRouter();

  const navigateToEvent = () => {
    router.push(`/events/${event._id}`);
  };

  const eventStatus = getEventStatus(event.startDate, event.endDate);
  const statusStyle = getEventStatusStyle(eventStatus);

  useEffect(() => {
    const dateTime = formatEventDateTime(event.startDate, event.endDate);
    setFormattedDateTime(dateTime);
  }, [event.startDate, event.endDate]);

  return (
    <div
      onClick={navigateToEvent}
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-40 bg-violet-100">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-violet-500">
            Event Image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {event.description || "No description available"}
        </p>
        <div className="mt-auto space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <CalendarIcon size={16} />
            <span>{formattedDateTime.date || "Date TBD"}</span>
          </div>
          {formattedDateTime.time && (
            <div className="flex items-center gap-2 text-gray-500">
              <Clock size={16} />
              <span>{formattedDateTime.time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin size={16} />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex items-center justify-between">
          {/* <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded">
            {event.category || "Event"}
          </span> */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${statusStyle}`}
          >
            {eventStatus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
