import { CalendarIcon, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { formatEventDateTime } from "@/app/utils/formatDate";
import {
  getEventStatus,
  getEventStatusStyle,
} from "@/app/events/util/getEventStatus";
import { useRouter } from "next/navigation";
import { Event } from "@/app/typings/events/typings";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EventCard = ({
  event,
  canEditOrg,
}: {
  event: Event;
  canEditOrg?: boolean;
}) => {
  const [formattedDateTime, setFormattedDateTime] = useState({
    date: "",
    time: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const navigateToEvent = () => {
    router.push(`/events/${event._id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    router.push(`/events/${event._id}/edit`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/events/${event._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");

      console.log("Deleting event:", event._id);

      // Close the dialog
      setIsDeleteDialogOpen(false);

      // Show success toast
      toast.success("Event deleted successfully");

      // Optional: Refresh the page or update the events list
      router.refresh();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
    }
  };

  const eventStatus = getEventStatus(event.startDate, event.endDate);
  const statusStyle = getEventStatusStyle(eventStatus);

  useEffect(() => {
    const dateTime = formatEventDateTime(event.startDate, event.endDate);
    setFormattedDateTime(dateTime);
  }, [event.startDate, event.endDate]);

  return (
    <>
      <div
        onClick={navigateToEvent}
        className="border bg-black rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full relative"
      >
        {canEditOrg && (
          <div className="absolute top-2 right-2 z-10 flex gap-2">
            <button
              onClick={handleEdit}
              className="p-1.5 bg-violet-900/70 hover:bg-violet-800 rounded-full text-white"
              title="Edit event"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 bg-red-900/70 hover:bg-red-800 rounded-full text-white"
              title="Delete event"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

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
            <span
              className={`text-xs font-medium px-2 py-1 rounded ${statusStyle}`}
            >
              {eventStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{event.title}"? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
