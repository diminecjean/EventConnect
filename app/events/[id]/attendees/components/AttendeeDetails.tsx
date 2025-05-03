import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, UserCheck, Calendar, Mail } from "lucide-react";
import type { Registration } from "../hooks/useAttendees";

interface AttendeeDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAttendee: Registration | null;
  handleCheckIn: (id: string) => void;
}

export default function AttendeeDetails({
  open,
  onOpenChange,
  selectedAttendee,
  handleCheckIn,
}: AttendeeDetailsProps) {
  if (!selectedAttendee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registration Details</DialogTitle>
        </DialogHeader>

        <div className="mt-4 border-2 rounded-lg border-gray-200/40">
          <div className="p-4 rounded-lg mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedAttendee.userId.name}
                </h3>
                <p className="text-gray-600 flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedAttendee.userId.email}
                </p>
                <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Registered on{" "}
                  {new Date(
                    selectedAttendee.registrationDate,
                  ).toLocaleDateString()}
                </p>
              </div>
              {selectedAttendee.checkedIn ? (
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-200"
                >
                  <CheckCircle className="w-3.5 h-3.5 mr-1" />
                  Checked In
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-yellow-700 border-yellow-200"
                >
                  Not Checked In
                </Badge>
              )}
            </div>
            {selectedAttendee.checkedIn && selectedAttendee.checkedInTime && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" />
                Checked in at{" "}
                {new Date(
                  selectedAttendee.checkedInTime,
                ).toLocaleTimeString()}{" "}
                on{" "}
                {new Date(selectedAttendee.checkedInTime).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="border-t p-4">
            <h4 className="font-medium mb-3">Registration Responses</h4>
            {Object.keys(selectedAttendee.formResponses || {}).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(selectedAttendee.formResponses).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="grid grid-cols-3 gap-4 p-2 even:bg-gray-50/30 rounded"
                    >
                      <div className="font-medium text-gray-700">{key}</div>
                      <div className="col-span-2 break-words">
                        {typeof value === "string"
                          ? value
                          : JSON.stringify(value)}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No form responses available
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          {!selectedAttendee.checkedIn && (
            <Button
              onClick={() => {
                handleCheckIn(selectedAttendee._id);
                onOpenChange(false);
              }}
              className="bg-violet-700 hover:bg-violet-800"
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Check In Attendee
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
