"use client";
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { BASE_URL } from "@/app/api/constants";
import SubscribersList from "./SubscriberList";

interface SubscribersCountProps {
  organizationId: string;
}

export default function SubscribersCount({
  organizationId,
}: SubscribersCountProps) {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriberCount = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/organizations/${organizationId}/subscribe?countOnly=true`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch subscriber count");
        }

        const data = await response.json();
        setCount(data.subscriberCount);
      } catch (error) {
        console.error("Error fetching subscriber count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriberCount();
  }, [organizationId]);

  // Create clickable content that will trigger the subscriber list
  const clickableContent = (
    <div className="flex items-center gap-2 text-sm cursor-pointer hover:text-violet-400 transition-colors">
      <Users size={14} />
      {isLoading ? (
        <span className="text-gray-400">Loading...</span>
      ) : (
        <span>{count ?? 0} subscribers</span>
      )}
    </div>
  );

  return (
    <SubscribersList
      organizationId={organizationId}
      trigger={clickableContent}
    />
  );
}
