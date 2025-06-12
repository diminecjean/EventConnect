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

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  subscribedAt: string;
}

interface SubscribersListProps {
  organizationId: string;
  trigger?: React.ReactNode;
}

export default function SubscribersList({
  organizationId,
  trigger,
}: SubscribersListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const fetchSubscribers = async () => {
    if (!isOpen) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/organizations/${organizationId}/subscribe`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [isOpen, organizationId]);

  const filteredSubscribers = subscribers.filter(
    (subscriber) =>
      subscriber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setIsOpen(true)}
      className="flex gap-2 items-center"
    >
      <Users size={16} />
      <span>View Subscribers</span>
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
            <DialogTitle className="text-center mb-4">Subscribers</DialogTitle>

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
            ) : filteredSubscribers.length > 0 ? (
              <div className="space-y-2">
                {filteredSubscribers.map((subscriber) => (
                  <div
                    key={subscriber._id}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => handleViewProfile(subscriber._id)}
                    >
                      <Avatar>
                        <AvatarImage src={subscriber.profilePicture} />
                        <AvatarFallback className="bg-violet-200 text-violet-800">
                          {getInitials(subscriber.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{subscriber.name}</p>
                        <p className="text-sm text-gray-500">
                          {subscriber.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          Subscribed: {formatDate(subscriber.subscribedAt)}
                        </p>
                      </div>
                    </div>

                    {currentUser && currentUser._id !== subscriber._id && (
                      <ConnectionButton
                        userId={subscriber._id}
                        size="sm"
                        className="shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No matching subscribers found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
