import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  eventFormSchema,
  EventFormValues,
} from "../eventFormComponents/schemas";
import { BASE_URL } from "@/app/api/constants";
import { uploadImageToSupabase } from "@/app/utils/supabase/imageUploadUtil";

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
      tags: [],
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

  // #region isEditMode

  // If in edit mode and no default values are provided, fetch the event data
  useEffect(() => {
    if (isEditMode && !defaultValues) {
      console.log("fetch event to edit");
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

  // If in edit mode and default values are provided, set the form with those values
  useEffect(() => {
    if (defaultValues && Object.keys(defaultValues).length > 0) {
      console.log("Setting form with provided defaultValues:", defaultValues);

      try {
        // Helper function to safely create a Date object
        const createSafeDate = (dateValue: any): Date => {
          if (!dateValue) return new Date();

          // If it's already a Date object
          if (dateValue instanceof Date) return new Date(dateValue);

          // If it's a MongoDB date format with $date property
          if (typeof dateValue === "object" && dateValue.$date) {
            return new Date(dateValue.$date);
          }

          // If it's an ISO string or timestamp
          return new Date(dateValue);
        };

        // Create proper Date objects for all date fields
        const startDate = createSafeDate(defaultValues.startDate);
        const endDate = defaultValues.endDate
          ? createSafeDate(defaultValues.endDate)
          : undefined;

        // For time fields, use the same dates but ensure they're valid
        const startTime = defaultValues.startTime
          ? createSafeDate(defaultValues.startTime)
          : startDate;
        const endTime = defaultValues.endTime
          ? createSafeDate(defaultValues.endTime)
          : endDate;

        // Log the processed dates for debugging
        console.log("Processed dates:", {
          startDateOriginal: defaultValues.startDate,
          startDateProcessed: startDate,
          startTimeProcessed: startTime,
          endDateOriginal: defaultValues.endDate,
          endDateProcessed: endDate,
          endTimeProcessed: endTime,
        });

        // Reset the form with all values including processed dates
        form.reset({
          ...defaultValues,
          startDate,
          endDate,
          startTime,
          endTime,
          // Ensure organizationId is set
          organizationId: defaultValues.organizationId || organizationId,
        });
      } catch (error) {
        console.error("Error processing date fields:", error);
      }
    }
  }, [defaultValues, form, organizationId]);

  // #endregion isEditMode

  // Form submission handler
  const onSubmit = async (data: EventFormValues) => {
    setIsSubmitting(true);
    console.log("Submitting form data");

    try {
      // Upload all images to Supabase
      const uploadTasks = [];

      // Process main images
      if (data.bannerUrl instanceof File) {
        uploadTasks.push(
          uploadImageToSupabase(data.bannerUrl, "banners").then((url) => {
            data.bannerUrl = url;
          }),
        );
      }

      if (data.imageUrl instanceof File) {
        uploadTasks.push(
          uploadImageToSupabase(data.imageUrl, "posters").then((url) => {
            data.imageUrl = url;
          }),
        );
      }

      // Process gallery images
      if (data.galleryImages && data.galleryImages.length) {
        const galleryImages = data.galleryImages;
        for (let i = 0; i < galleryImages.length; i++) {
          const image = galleryImages[i];
          if (image instanceof File) {
            uploadTasks.push(
              uploadImageToSupabase(image, "gallery").then((url) => {
                galleryImages[i] = url;
              }),
            );
          }
        }
      }

      // Process speaker images
      if (data.speakers && data.speakers.length) {
        const speakers = data.speakers;
        for (let i = 0; i < speakers.length; i++) {
          const imageUrl = speakers[i].imageUrl;
          if (imageUrl instanceof File) {
            uploadTasks.push(
              uploadImageToSupabase(imageUrl, "speakers").then((url) => {
                if (url) speakers[i].imageUrl = url;
              }),
            );
          }
        }
      }

      // Process sponsor logos
      if (data.sponsors && data.sponsors.length) {
        const sponsors = data.sponsors;
        for (let i = 0; i < sponsors.length; i++) {
          const logoUrl = sponsors[i].logoUrl;
          if (logoUrl instanceof File) {
            uploadTasks.push(
              uploadImageToSupabase(logoUrl, "sponsors").then((url) => {
                if (url) sponsors[i].logoUrl = url;
              }),
            );
          }
        }
      }

      // Wait for all uploads to complete
      await Promise.all(uploadTasks);

      // Continue with existing logic
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
      const processedRegistrationForms = data.registrationForms.map((form) => ({
        ...form,
        formFields: form.formFields.map((field) => {
          // Process field options
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
          : { createdAt: new Date(), updatedAt: new Date() }),
      };

      console.log(JSON.stringify({ submissionData }));

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
      if (!isEditMode) {
        router.push(`/profile/organization/${organizationId}`);
      } else {
        router.push(`/events/${eventId}`);
      }
      router.refresh(); // Refresh the page to show the updated data
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
