import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import BadgeDisplay from "./BadgeDisplay";
import { Badge } from "./typings";
import { useState } from "react";
import { toast } from "sonner";
import { Confetti } from "@/components/ui/confetti";

interface BadgeClaimDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badge: Badge | null;
  userId: string;
  eventId: string;
  onClaim: () => void;
}

export default function BadgeClaimDialog({
  open,
  onOpenChange,
  badge,
  userId,
  eventId,
  onClaim,
}: BadgeClaimDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!badge) return null;

  // Get customized dialog description based on badge type
  const getDialogDescription = () => {
    // TODO: Get event name from eventId
    const eventName = "this event";

    switch (badge.type?.toLowerCase()) {
      case "participant":
        return `You've earned this badge for attending ${eventName}!`;
      case "speaker":
        return `Congratulations on being a speaker at ${eventName}! This badge recognizes your contribution.`;
      case "sponsor":
        return `Thank you for sponsoring ${eventName}! This badge acknowledges your support.`;
      case "volunteer":
        return `Thanks for volunteering at ${eventName}! Your help made the event possible.`;
      case "organizer":
        return `You've earned this badge for organizing ${eventName}! Great job!`;
      default:
        return `You've earned this badge for your involvement with ${eventName}!`;
    }
  };

  const handleClaim = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/badges/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          badgeId: badge._id,
          userId,
          eventId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to claim badge");
      }

      // Show success and confetti
      setShowConfetti(true);
      toast.success("Badge claimed successfully!");

      setTimeout(() => {
        onClaim();
        onOpenChange(false);
      }, 3000);
    } catch (error) {
      console.error("Error claiming badge:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to claim badge",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg justify-center">
        {showConfetti && <Confetti />}
        <DialogHeader>
          <DialogTitle className="my-2">Claim Your Badge</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-4">
          <div className="max-w-[200px]">
            <BadgeDisplay badge={badge} size="lg" />
          </div>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            onClick={handleClaim}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? "Claiming..." : "Claim Badge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
