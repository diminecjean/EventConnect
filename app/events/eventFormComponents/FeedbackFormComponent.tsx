"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star } from "lucide-react";
import { useAuth } from "@/app/context/authContext";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BASE_URL } from "@/app/api/constants";

interface FeedbackFormProps {
  eventId: string;
  onSuccess?: () => void;
}

const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
  anonymous: z.boolean().default(false),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

export default function FeedbackForm({
  eventId,
  onSuccess,
}: FeedbackFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: "",
      anonymous: false,
    },
  });

  const onSubmit = async (values: FeedbackValues) => {
    if (!user) {
      toast.error("You must be logged in to submit feedback");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${BASE_URL}/api/events/${eventId}/feedback?userId=${user._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit feedback");
      }

      toast.success("Thank you for your feedback!");
      form.reset();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center p-4 rounded-lg">
        <p>Please log in to submit feedback for this event</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={`h-8 w-8 cursor-pointer ${
                        (ratingHover || field.value) >= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                      onClick={() => field.onChange(rating)}
                      onMouseEnter={() => setRatingHover(rating)}
                      onMouseLeave={() => setRatingHover(null)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your feedback</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share your thoughts about this event..."
                  className="resize-none min-h-32"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your feedback helps organizers improve future events.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="anonymous"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Submit anonymously</FormLabel>
                <FormDescription>
                  Your name will not be displayed with your feedback.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-violet-700 hover:bg-violet-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </form>
    </Form>
  );
}
