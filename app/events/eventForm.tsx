"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormImageUploader from './imageUploader';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BASE_URL } from "@/app/api/constants";
import { cn } from "@/lib/utils";

// Define the form schema using Zod
const eventFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  startDate: z.date(),
  endDate: z.date().optional(),
  maxAttendees: z.number().positive().optional(),
  imageUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  organizationId: z.string(), // Required to associate event with organization
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  organizationId: string;
  organizationName?: string;
  eventId?: string; // Optional - present only when editing
  eventName?: string; // Optional - present only when editing
  defaultValues?: Partial<EventFormValues>;
}

export default function EventForm({ organizationId, organizationName, eventId, eventName, defaultValues }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!eventId;

  // Initialize the form with default values
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: new Date(),
      maxAttendees: undefined,
      imageUrl: "",
      organizationId, // Set the organizationId from props
      ...defaultValues
    },
  });

  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && !defaultValues) {
      const fetchEvent = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/events/${eventId}`);
          if (!response.ok) throw new Error("Failed to fetch event");
          
          const eventData = await response.json();
          
          // Transform the data to match form fields
          form.reset({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startDate: new Date(eventData.startDate),
            endDate: eventData.endDate ? new Date(eventData.endDate) : undefined,
            maxAttendees: eventData.maxAttendees,
            imageUrl: eventData.imageUrl,
            organizationId: eventData.organizationId || organizationId,
          });
        } catch (error) {
          console.error("Error fetching event data:", error);
        }
      };
      
      fetchEvent();
    }
  }, [isEditMode, eventId, organizationId, defaultValues, form]);

  // Form submission handler
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    
    try {
      const endpoint = isEditMode
        ? `${BASE_URL}/api/events/${eventId}`
        : `${BASE_URL}/api/events`;
      
      const method = isEditMode ? "PUT" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save event");
      }
      
      // Navigate back to organization profile page
      router.push(`/profile/organization/${organizationId}`);
      router.refresh(); // Refresh the page to show the updated data
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? `Edit Event - ${eventName}` : `Create New Event for ${organizationName}`}
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bannerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Image</FormLabel>
                <FormControl>
                <FormImageUploader
                  name="image"
                  onChange={(file) => field.onChange(file)}
                  required={true}
                  maxSizeMB={2}
                  height={256}
                  scaleDesc="1080px x 256px"
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row w-full gap-6">
            {/* Left col */}
            <div className="flex flex-col min-w-lg gap-6">
            <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Image</FormLabel>
                <FormControl>
                <FormImageUploader
                  name="image"
                  onChange={(file) => field.onChange(file)}
                  required={true}
                  maxSizeMB={2}
                  width={350}
                  height={350}
                />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
                    
          {/* Start and end date */}
          <div className="flex flex-row justify-between gap-2">
            <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant="outline"
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>Pick a start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                <FormItem className="flex flex-col w-full">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant="outline"
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input placeholder="Event location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="maxAttendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Attendees (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Leave blank for unlimited"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value, 10) : undefined;
                      field.onChange(value);
                    }}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
            </div>
            {/* Right col */}
            <div className="flex flex-col w-full gap-6">
            <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your event" 
                    className="min-h-32"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          
 
            </div>
          </div>
                   
          {/* Hidden field for organizationId */}
          <input type="hidden" {...form.register("organizationId")} />
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditMode ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}