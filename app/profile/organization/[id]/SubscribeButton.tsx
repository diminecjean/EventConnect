"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/authContext";
import { BASE_URL } from "@/app/api/constants";
import { Button } from "@/components/ui/button";

type SubscribeButtonProps = {
  organizationId: string;
  organizationName?: string;
};

export function SubscribeButton({
  organizationId,
  organizationName = "this organization",
}: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if the user is already subscribed
    const checkSubscription = async () => {
      if (!user || !user._id) return;

      try {
        const response = await fetch(
          `${BASE_URL}/api/organizations/${organizationId}/subscribe`,
        );
        if (response.ok) {
          const data = await response.json();
          const subscriptions = data.subscribers || [];

          // Check if organization subscription includes the user
          setIsSubscribed(
            subscriptions.some((subscriber: any) => {
              const subscriberId =
                typeof subscriber === "object" && subscriber._id
                  ? subscriber._id.toString()
                  : subscriber.toString();
              return subscriberId === user._id.toString();
            }),
          );
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [user, organizationId]);

  const toggleSubscription = async () => {
    if (!user || !user._id) return;

    setIsLoading(true);
    try {
      const method = isSubscribed ? "DELETE" : "POST";
      const response = await fetch(
        `${BASE_URL}/api/organizations/${organizationId}/subscribe`,
        {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user._id }),
        },
      );

      if (response.ok) {
        console.log({ response });
        setIsSubscribed(!isSubscribed);
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no user is logged in
  if (!user) return null;

  return (
    <Button
      onClick={toggleSubscription}
      disabled={isLoading}
      variant="outline_violet"
      className={"transition rounded-lg text-violet-500 font-semibold"}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      ) : isSubscribed ? (
        "Unsubscribe"
      ) : (
        `Subscribe`
      )}
    </Button>
  );
}
