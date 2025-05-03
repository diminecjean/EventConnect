import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Eye, UserCheck, Calendar } from "lucide-react";
import type { Registration } from "../hooks/useAttendees";

interface AttendeeGridProps {
  filteredAttendees: Registration[];
  handleViewResponses: (attendee: Registration) => void;
  handleCheckIn: (id: string) => void;
}

export default function AttendeeGrid({
  filteredAttendees,
  handleViewResponses,
  handleCheckIn,
}: AttendeeGridProps) {
  return (
    <div className="p-4">
      {filteredAttendees.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAttendees.map((attendee) => (
            <Card
              key={attendee._id}
              className={attendee.checkedIn ? "border-green-200" : ""}
              onClick={() => handleViewResponses(attendee)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">
                      {attendee.userId.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      {attendee.userId.email}
                    </p>
                  </div>
                  {/* {attendee.checkedIn ? (
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-200"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Checked In
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-yellow-700 border-yellow-200"
                    >
                      Not Checked In
                    </Badge>
                  )} */}
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex gap-1 items-center text-sm text-gray-500 mb-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Registered on{" "}
                    {new Date(attendee.registrationDate).toLocaleDateString()}
                  </span>
                </div>

                {attendee.checkedIn && attendee.checkedInTime && (
                  <div className="flex gap-1 items-center text-sm text-green-600 mb-2">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>
                      Checked in at{" "}
                      {new Date(attendee.checkedInTime).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                <div className="mt-4 flex gap-2 justify-end">
                  {!attendee.checkedIn && (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(attendee._id)}
                      className="bg-violet-700 hover:bg-violet-800"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Check In
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          No matching attendees found
        </div>
      )}
    </div>
  );
}
