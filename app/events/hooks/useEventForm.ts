import { useState, useEffect } from "react";
import { Noop, RefCallBack, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { eventFormSchema, EventFormValues } from "../eventFormComponents/schemas";
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
      endDate: undefined,
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
      };

      const endpoint = isEditMode
        ? `${BASE_URL}/api/events/${eventId}`
        : `${BASE_URL}/api/events`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
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

  // #region Date and Time Utils
  // Handle date selection
  const handleDateSelect = (
    field: {
      onChange: any;
      onBlur?: Noop;
      value?: Date | undefined;
      disabled?: boolean | undefined;
      name?: "startTime" | "endTime";
      ref?: RefCallBack;
    },
    date: Date,
  ) => {
    if (date) {
      field.onChange(date);
    }
  };

  // Handle time change
  const handleTimeChange = (
    field: {
      onChange: any;
      onBlur?: Noop;
      value: any;
      disabled?: boolean | undefined;
      name?: "startTime" | "endTime";
      ref?: RefCallBack;
    },
    type: string,
    value: string,
  ) => {
    const currentDate = field.value || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    field.onChange(newDate);
  };

  // Helper function to validate end time on the same day
  const validateEndTime = (
    startDate: Date,
    startTime: Date,
    endTime?: Date,
  ) => {
    if (!startDate || !startTime || !endTime) return;

    // Check if it's the same day
    const sameDay =
      startDate &&
      endTime &&
      startDate.getFullYear() === endTime.getFullYear() &&
      startDate.getMonth() === endTime.getMonth() &&
      startDate.getDate() === endTime.getDate();

    if (sameDay) {
      const startHours = startTime.getHours();
      const startMinutes = startTime.getMinutes();
      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();

      // Compare hours and minutes
      if (
        endHours < startHours ||
        (endHours === startHours && endMinutes <= startMinutes)
      ) {
        form.setError("endTime", {
          type: "manual",
          message: "End time must be after start time on the same day",
        });
      } else {
        form.clearErrors("endTime");
      }
    }
  };

  // Helper function to combine date and time
  const combineDateAndTime = (date: Date, time: Date): Date | null => {
    if (!date || !time) return null;

    const combined = new Date(date);
    combined.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return combined;
  };
  // #endregion

  return {
    form,
    onSubmit,
    isSubmitting,
    isEditMode,
    handleDateSelect,
    handleTimeChange,
    validateEndTime,
    combineDateAndTime,
  };
}
