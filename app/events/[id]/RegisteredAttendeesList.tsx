"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { BASE_URL } from "@/app/api/constants";
import { useRouter } from "next/navigation";
import { SkeletonUserCardHorziontal } from "@/components/ui/skeleton";
import { useAuth } from "@/app/context/authContext";
import ConnectionButton from "@/app/connections/ConnectionButton";
import { useConnections } from "@/app/connections/useConnections";

interface Attendee {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    profileImage?: string;
  };
  registrationDate: string;
}

interface RegisteredAttendeesListProps {
  eventId: string;
  trigger?: React.ReactNode;
}

export default function RegisteredAttendeesList({
  eventId,
  trigger,
}: RegisteredAttendeesListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { checkConnectionStatuses } = useConnections();

  const fetchAttendees = async () => {
    if (!isOpen) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/events/${eventId}/attendees`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendees");
      }

      const data = await response.json();
      setAttendees(data.attendees || []);

      // If user is logged in, check connection status for each attendee
      if (currentUser && currentUser._id) {
        const userIds = data.attendees
          .filter((a: Attendee) => a.userId._id !== currentUser._id)
          .map((a: Attendee) => a.userId._id);

        await checkConnectionStatuses(userIds);
      }
    } catch (error) {
      console.error("Error fetching attendees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [isOpen, eventId]);

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendee.userId.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/user/${userId}`);
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsOpen(true)}
      className="flex gap-2 items-center"
    >
      <Users size={16} />
      <span>View Attendees</span>
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center mb-4">
              Registered Attendees
            </DialogTitle>

            <div className="relative mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by name or email"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </DialogHeader>

          <div className="max-h-[50vh] overflow-y-auto pr-1">
            {isLoading ? (
              <div className="space-y-3">
                <SkeletonUserCardHorziontal array={[1, 2, 3]} />
              </div>
            ) : filteredAttendees.length > 0 ? (
              <div className="space-y-2">
                {filteredAttendees.map((attendee) => (
                  <div
                    key={attendee._id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleViewProfile(attendee.userId._id)}
                    >
                      <Avatar>
                        <AvatarImage src={attendee.userId.profileImage} />
                        <AvatarFallback className="bg-violet-200 text-violet-800">
                          {getInitials(attendee.userId.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{attendee.userId.name}</p>
                        <p className="text-sm text-gray-500">
                          {attendee.userId.email}
                        </p>
                      </div>
                    </div>

                    {/* Only show connect button if user is logged in and not viewing their own profile */}
                    {currentUser && currentUser._id !== attendee.userId._id && (
                      <ConnectionButton
                        userId={attendee.userId._id}
                        size="sm"
                        className="shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No matching attendees found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
