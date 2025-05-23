"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import BadgeDisplay from "@/components/badge/BadgeDisplay";
import { BASE_URL } from "@/app/api/constants";
import { Badge } from "@/components/badge/typings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/app/typings/profile/typings";

type IBadge = Badge & { claimed?: boolean };

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<IBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user?._id) return;

      try {
        setIsLoading(true);
        const response = await fetch(
          `${BASE_URL}/api/badges?userId=${user._id}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch badges");
        }

        const data = await response.json();
        // Filter to only claimed badges
        const claimedBadges = data.badges.filter(
          (badge: IBadge) => badge.claimed,
        );
        setBadges(claimedBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  return (
    <>
      {badges.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-400">
              You haven't earned any badges yet. Attend events and check in to
              earn badges!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-row justify-start gap-4">
          {badges.map((badge) => (
            <BadgeDisplay
              size="md"
              variant="badge-only"
              key={badge._id}
              badge={badge}
              claimed={true}
            />
          ))}
        </div>
      )}
    </>
  );
}
