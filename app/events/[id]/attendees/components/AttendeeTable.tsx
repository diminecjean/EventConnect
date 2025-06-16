import React from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Eye, UserCheck, Mail, Info } from "lucide-react";
import type { Registration } from "../hooks/useAttendees";

interface AttendeeTableProps {
  filteredAttendees: Registration[];
  isBulkCheckInMode: boolean;
  selectedAttendees: Set<string>;
  toggleAttendeeSelection: (id: string) => void;
  handleViewResponses: (attendee: Registration) => void;
  handleCheckIn: (id: string) => void;
}

export default function AttendeeTable({
  filteredAttendees,
  isBulkCheckInMode,
  selectedAttendees,
  toggleAttendeeSelection,
  handleViewResponses,
  handleCheckIn,
}: AttendeeTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="bg-gray-600/30 rounded-xl">
        <TableHeader>
          <TableRow>
            {isBulkCheckInMode && (
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
            )}
            <TableHead className="font-medium">Registration Type</TableHead>
            <TableHead className="font-medium text-white">Name</TableHead>
            <TableHead className="font-medium">Email</TableHead>
            <TableHead className="font-medium">Registration Date</TableHead>
            <TableHead className="font-medium">Status</TableHead>
            <TableHead className="font-medium text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAttendees.length > 0 ? (
            filteredAttendees.map((attendee) => (
              <TableRow
                key={attendee._id}
                onClick={() =>
                  !isBulkCheckInMode && handleViewResponses(attendee)
                }
                className="cursor-pointer hover:bg-violet-700/50 transition-colors"
              >
                {isBulkCheckInMode && !attendee.checkedIn && (
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedAttendees.has(attendee.userId._id)}
                      onChange={() =>
                        toggleAttendeeSelection(attendee.userId._id)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                  </TableCell>
                )}
                {isBulkCheckInMode && attendee.checkedIn && (
                  <TableCell></TableCell>
                )}

                <TableCell>
                  <span className="text-sm">
                    {attendee.registrationFormName || "Default Registration"}
                  </span>
                </TableCell>

                <TableCell className="font-medium">
                  {attendee.userId.name}
                </TableCell>

                <TableCell>
                  <div className="flex flex-row items-center gap-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-sm">{attendee.userId.email}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {new Date(attendee.registrationDate).toLocaleDateString()}
                  </span>
                </TableCell>

                <TableCell>
                  {attendee.checkedIn ? (
                    <div className="flex flex-row px-1 py-1 items-center justify-center rounded-full text-green-500 border border-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Checked In
                      {attendee.checkedInTime && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 ml-1 text-green-600" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Checked in at{" "}
                                {new Date(
                                  attendee.checkedInTime,
                                ).toLocaleTimeString()}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-row px-1 py-1 items-center justify-center rounded-full text-yellow-500 border border-yelow-500">
                      Not Checked In
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!attendee.checkedIn && !isBulkCheckInMode && (
                      <Button
                        size="sm"
                        onClick={() => handleCheckIn(attendee.userId._id)}
                        className="h-8 px-2 bg-violet-700 hover:bg-violet-800"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1" />
                        Check In
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={isBulkCheckInMode ? 6 : 5}
                className="text-center py-10 text-gray-500"
              >
                No matching attendees found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
