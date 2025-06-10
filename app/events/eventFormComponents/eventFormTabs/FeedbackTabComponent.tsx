"use client";

import { useEffect, useState } from "react";
import { BASE_URL } from "@/app/api/constants";
import { Star } from "lucide-react";
import FeedbackForm from "../FeedbackFormComponent";
import { useAuth } from "@/app/context/authContext";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EventFeedback {
  _id: string;
  userId: string;
  userName: string | null;
  userProfilePicture: string | null;
  rating: number;
  comment: string;
  createdAt: string;
  anonymous: boolean;
}

interface FeedbackTabProps {
  eventId: string;
  isRegistered: boolean;
  isOrganizer: boolean;
  isPastEvent: boolean;
}

export default function FeedbackTab({
  eventId,
  isRegistered,
  isOrganizer,
  isPastEvent,
}: FeedbackTabProps) {
  const [feedback, setFeedback] = useState<EventFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { user } = useAuth();

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/events/${eventId}/feedback`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }

      const data = await response.json();
      setFeedback(data.feedback || []);

      // Check if current user has already submitted feedback
      if (user) {
        const userFeedback = data.feedback?.find(
          (f: EventFeedback) => f.userId === user._id,
        );
        setHasSubmitted(!!userFeedback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [eventId, user]);

  const handleFeedbackSuccess = () => {
    fetchFeedback();
    setHasSubmitted(true);
  };

  // Calculate average rating
  const averageRating = feedback.length
    ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
    : 0;

  // Format average rating to 1 decimal place
  const formattedRating = averageRating.toFixed(1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Event Feedback</h2>
          {feedback.length > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 font-medium">
                  {formattedRating} ({feedback.length} review
                  {feedback.length !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show feedback form for registered users for events that have ended */}
      {isPastEvent && isRegistered && !hasSubmitted && (
        <div className="p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Share Your Feedback</h3>
          <FeedbackForm eventId={eventId} onSuccess={handleFeedbackSuccess} />
        </div>
      )}

      {/* If user already submitted feedback */}
      {isPastEvent && isRegistered && hasSubmitted && (
        <div className="bg-green-500/40 py-4 px-6 rounded-xl border-2 border-green-700">
          <p className="text-green-200">
            Thank you for submitting your feedback!
          </p>
        </div>
      )}

      {/* Show existing feedback */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/5" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">Error loading feedback: {error}</p>
      ) : feedback.length > 0 ? (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item._id}
              className="border bg-gray-800/30 rounded-lg p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar>
                  <AvatarImage
                    src={item.userProfilePicture || ""}
                    alt={item.userName || "Anonymous"}
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback>
                    {item.userName
                      ? item.userName.substring(0, 2).toUpperCase()
                      : "AN"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {item.userName || "Anonymous"}
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= item.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="ml-auto text-sm text-gray-400">
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <p className="text-gray-200">{item.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-200 italic">
          No feedback has been submitted yet.
        </p>
      )}
    </div>
  );
}
