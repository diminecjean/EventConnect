import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BASE_URL } from "@/app/api/constants";

export type Registration = {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  registrationDate: string;
  formResponses: Record<string, any>;
  checkedIn: boolean;
  checkedInTime?: string;
};

export type AttendeeStats = {
  total: number;
  checkedIn: number;
  registered: number;
  checkInRate: number;
  eventDate: string;
};

export default function useAttendees(eventId: string) {
  const [attendees, setAttendees] = useState<Registration[]>([]);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "checked-in" | "registered"
  >("all");
  const [isBulkCheckInMode, setIsBulkCheckInMode] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  async function fetchAttendees() {
    try {
      setIsLoading(true);

      // Fetch event details to verify permissions and get title
      const eventResponse = await fetch(`${BASE_URL}/api/events/${eventId}`);
      if (!eventResponse.ok) {
        throw new Error("Failed to fetch event");
      }

      const eventData = await eventResponse.json();
      setEventTitle(eventData.event.title);
      setEventDate(eventData.event.startDate);

      // Fetch attendees
      const attendeesResponse = await fetch(
        `${BASE_URL}/api/events/${eventId}/attendees`,
      );
      if (!attendeesResponse.ok) {
        throw new Error("Failed to fetch attendees");
      }

      const attendeesData = await attendeesResponse.json();
      console.log({ attendeesData });
      setAttendees(attendeesData.attendees);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast.error("Failed to load attendees");
    } finally {
      setIsLoading(false);
    }
  }

  const checkInAttendee = async (attendeeId: string) => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/events/${eventId}/attendees/${attendeeId}/checkin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to check in attendee");
      }

      // Update the local state
      setAttendees(
        attendees.map((attendee) =>
          attendee.userId._id === attendeeId
            ? {
                ...attendee,
                checkedIn: true,
                checkedInTime: new Date().toISOString(),
              }
            : attendee,
        ),
      );

      toast.success("Attendee checked in successfully");
      return true;
    } catch (error) {
      console.error("Error checking in attendee:", error);
      toast.error("Failed to check in attendee");
      return false;
    }
  };

  const bulkCheckIn = async () => {
    if (selectedAttendees.size === 0) {
      toast.warning("No attendees selected for check-in");
      return;
    }

    try {
      // Create a copy of the set for iteration safety
      const attendeesToCheckIn = Array.from(selectedAttendees);
      let successCount = 0;

      // Process check-ins sequentially
      for (const attendeeId of attendeesToCheckIn) {
        const response = await fetch(
          `${BASE_URL}/api/events/${eventId}/attendees/${attendeeId}/checkin`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          successCount++;
        }
      }

      // Update the local state for all successfully checked-in attendees
      setAttendees(
        attendees.map((attendee) =>
          selectedAttendees.has(attendee._id)
            ? {
                ...attendee,
                checkedIn: true,
                checkedInTime: new Date().toISOString(),
              }
            : attendee,
        ),
      );

      // Clear selections
      setSelectedAttendees(new Set());
      setIsBulkCheckInMode(false);

      toast.success(`Successfully checked in ${successCount} attendees`);
      window.location.reload();
    } catch (error) {
      console.error("Error during bulk check-in:", error);
      toast.error("Failed to complete bulk check-in");
    }
  };

  const toggleAttendeeSelection = (attendeeId: string) => {
    const newSelection = new Set(selectedAttendees);
    if (newSelection.has(attendeeId)) {
      newSelection.delete(attendeeId);
    } else {
      newSelection.add(attendeeId);
    }
    setSelectedAttendees(newSelection);
  };

  // Filter attendees based on search and status
  const filteredAttendees = attendees.filter((attendee) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      attendee.userId.name.toLowerCase().includes(searchLower) ||
      attendee.userId.email.toLowerCase().includes(searchLower);

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "checked-in")
      return matchesSearch && attendee.checkedIn;
    if (statusFilter === "registered")
      return matchesSearch && !attendee.checkedIn;
    return matchesSearch;
  });

  const exportAttendeesToCsv = () => {
    // Create CSV content
    const headers = [
      "Name",
      "Email",
      "Registration Date",
      "Status",
      "Check-in Time",
    ];
    const rows = filteredAttendees.map((attendee) => [
      attendee.userId.name,
      attendee.userId.email,
      new Date(attendee.registrationDate).toLocaleDateString(),
      attendee.checkedIn ? "Checked In" : "Registered",
      attendee.checkedInTime
        ? new Date(attendee.checkedInTime).toLocaleString()
        : "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${eventTitle}-attendees.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Attendee list exported to CSV");
  };

  const stats: AttendeeStats = {
    total: attendees.length,
    checkedIn: attendees.filter((a) => a.checkedIn).length,
    registered: attendees.filter((a) => !a.checkedIn).length,
    checkInRate:
      attendees.length > 0
        ? Math.round(
            (attendees.filter((a) => a.checkedIn).length / attendees.length) *
              100,
          )
        : 0,
    eventDate: eventDate,
  };

  return {
    attendees,
    eventTitle,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isBulkCheckInMode,
    setIsBulkCheckInMode,
    selectedAttendees,
    setSelectedAttendees,
    filteredAttendees,
    stats,
    checkInAttendee,
    bulkCheckIn,
    toggleAttendeeSelection,
    exportAttendeesToCsv,
  };
}
