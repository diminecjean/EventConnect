import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  eventFormSchema,
  EventFormValues,
} from "../eventFormComponents/schemas";
import { BASE_URL } from "@/app/api/constants";

export function useEventForm({
  organizationId,
  eventId,
  defaultValues,
}: {
  organizationId: string;
  eventId?: string;
  defaultValues?: Partial<EventFormValues>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!eventId;

  // Initialize form
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(new Date().setHours(9, 0, 0, 0)), // Default to 9:00 AM
      endTime: new Date(new Date().setHours(17, 0, 0, 0)), // Default to 5:00 PM
      eventMode: "physical",
      virtualMeetingLink: "",
      maxAttendees: undefined,
      partnerOrganizations: [],
      imageUrl: "",
      bannerUrl: "",
      organizationId, // Set the organizationId from props
      speakers: [],
      sponsors: [],
      registrationForms: [
        {
          id: crypto.randomUUID(),
          name: "Participant",
          description: "Registration form for participants",
          formFields: [
            {
              id: crypto.randomUUID(),
              label: "Full Name",
              type: "text",
              required: true,
              placeholder: "Enter your full name",
            },
            {
              id: crypto.randomUUID(),
              label: "Email",
              type: "email",
              required: true,
              placeholder: "Enter your email address",
            },
          ],
          isDefault: true,
        },
      ],
      timelineItems: [],
      ...defaultValues,
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  // Fetch event data if in edit mode
  useEffect(() => {
    if (isEditMode && !defaultValues) {
      const fetchEvent = async () => {
        try {
          const response = await fetch(`${BASE_URL}/api/events/${eventId}`);
          if (!response.ok) throw new Error("Failed to fetch event");

          const eventData = await response.json();

          // Parse dates
          const startDate = new Date(eventData.startDate);
          const endDate = eventData.endDate
            ? new Date(eventData.endDate)
            : undefined;

          // Extract times (use same date but capture the time)
          const startTime = new Date(startDate);
          const endTime = endDate ? new Date(endDate) : undefined;

          // Transform the data to match form fields
          form.reset({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            startDate,
            endDate,
            startTime,
            endTime,
            maxAttendees: eventData.maxAttendees,
            imageUrl: eventData.imageUrl,
            bannerUrl: eventData.bannerUrl,
            eventMode: eventData.eventMode || "physical",
            virtualMeetingLink: eventData.virtualMeetingLink || "",
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
    console.log("Submitting form data");

    try {
      // Combine date and time for start and end
      const combinedStartDateTime = combineDateAndTime(
        data.startDate,
        data.startTime,
      );
      const combinedEndDateTime =
        data.endDate && data.endTime
          ? combineDateAndTime(data.endDate, data.endTime)
          : undefined;

      // Process registration forms
      // Format the form fields data as needed
      const processedRegistrationForms = data.registrationForms.map((form) => ({
        ...form,
        formFields: form.formFields.map((field) => {
          // Convert options from array to proper format if needed
          if (field.type === "select" && field.options) {
            return {
              ...field,
              options: field.options,
            };
          }
          return field;
        }),
      }));

      // Prepare the submission data
      const submissionData = {
        ...data,
        registrationForms: processedRegistrationForms,
        startDate: combinedStartDateTime,
        endDate: combinedEndDateTime,
        // Remove the time fields as they're now combined with the dates
        startTime: undefined,
        endTime: undefined,
        // Add timestamp fields conditionally based on edit mode
        ...(isEditMode 
          ? { updatedAt: new Date() } 
          : { createdAt: new Date(), updatedAt: new Date() })
      };

      console.log(JSON.stringify({ submissionData }));

      // const endpoint = isEditMode
      //   ? `${BASE_URL}/api/events/${eventId}`
      //   : `${BASE_URL}/api/events`;

      // const method = isEditMode ? "PUT" : "POST";

      // const response = await fetch(endpoint, {
      //   method,
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(submissionData),
      // });

      // if (!response.ok) {
      //   throw new Error("Failed to save event");
      // }

      // Navigate back to organization profile page
      // router.push(`/profile/organization/${organizationId}`);
      // router.refresh(); // Refresh the page to show the updated data
    } catch (error) {
      console.error("Error saving event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to combine date and time
  const combineDateAndTime = (date: Date, time: Date): Date | null => {
    if (!date || !time) return null;

    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  };

  return {
    form,
    onSubmit,
    isSubmitting,
    isEditMode,
  };
}
