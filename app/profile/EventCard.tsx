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
      className="border bg-black rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full"
    >
      <div className="relative h-40 bg-violet-400">
        {event.imageUrl ? (
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-violet-100">
            Event Image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow bg-black">
        <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">
          {event.description || "No description available"}
        </p>
        <div className="mt-auto space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <CalendarIcon size={16} />
            <span>{formattedDateTime.date || "Date TBD"}</span>
          </div>
          {formattedDateTime.time && (
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={16} />
              <span>{formattedDateTime.time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin size={16} />
              <span>{event.location}</span>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 py-3 border-t">
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
