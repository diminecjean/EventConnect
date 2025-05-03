import React from "react";
import { Button } from "@/components/ui/button";
import { UserCheck, Download, ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderActionsProps {
  eventId: string;
  isBulkCheckInMode: boolean;
  setIsBulkCheckInMode: (mode: boolean) => void;
  selectedAttendees: Set<string>;
  setSelectedAttendees: (attendees: Set<string>) => void;
  handleBulkCheckIn: () => void;
  handleExportAttendees: () => void;
  registeredCount: number;
}

export default function HeaderActions({
  eventId,
  isBulkCheckInMode,
  setIsBulkCheckInMode,
  selectedAttendees,
  setSelectedAttendees,
  handleBulkCheckIn,
  handleExportAttendees,
  registeredCount,
}: HeaderActionsProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/events/${eventId}`)}
        className="gap-1 hover:bg-gray-100"
      >
        <ChevronLeft className="h-4 w-4" /> Back to Event
      </Button>

      <div className="flex gap-2">
        {isBulkCheckInMode ? (
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsBulkCheckInMode(false);
                setSelectedAttendees(new Set());
              }}
              className="gap-1"
            >
              <X className="h-4 w-4" /> Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleBulkCheckIn}
              className="gap-1 bg-violet-700 hover:bg-violet-800"
              disabled={selectedAttendees.size === 0}
            >
              <UserCheck className="h-4 w-4" /> Check In{" "}
              {selectedAttendees.size} Attendees
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => setIsBulkCheckInMode(true)}
              className="gap-1"
              disabled={registeredCount === 0}
            >
              <UserCheck className="h-4 w-4" /> Bulk Check-In
            </Button>
            <Button
              variant="outline"
              onClick={handleExportAttendees}
              className="gap-1"
            >
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
