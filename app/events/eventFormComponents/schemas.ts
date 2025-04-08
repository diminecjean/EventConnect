import * as z from "zod";

export const formFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "number", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

export const registrationFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  formFields: z.array(formFieldSchema),
  isDefault: z.boolean().default(false),
});

// Define the form schema using Zod
export const eventFormSchema = z
  .object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(50, "Title must be at most 50 characters"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters")
      .max(650, "Description must be at most 650 characters"),
    location: z
      .string()
      .min(2, "Location must be at least 2 characters")
      .optional(),
    startDate: z.date(),
    endDate: z.date().optional(),
    startTime: z.date(),
    endTime: z.date().optional(),
    tags: z.array(
      z.union([
        z.string(), 
        z.object({ 
          label: z.string(),
          color: z.string()
        })
      ])
    ).optional(),
    maxAttendees: z.number().positive().optional(),
    partnerOrganizations: z.array(z.string()).default([]),
    imageUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    eventMode: z.enum(["physical", "hybrid", "online"]),
    virtualMeetingLink: z.string().url().optional().or(z.literal("")),
    organizationId: z.string(), // Required to associate event with organization
    registrationForms: z
      .array(registrationFormSchema)
      .min(1, "At least one registration form is required"),
    timelineItems: z
      .array(
        z.object({
          id: z.string(),
          date: z.date(),
          time: z.string(),
          title: z.string().min(1, "Item title is required"),
          description: z.string().optional(),
          speaker: z.string().optional(),
        }),
      )
      .optional(),
    speakers: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().min(1, "Speaker name is required"),
          topic: z.string().min(1, "Speaking topic is required"),
          organization: z.string().optional(),
          position: z.string().optional(),
          imageUrl: z.string().optional(),
          socialMedia: z.array(
            z.object({
              id: z.string(),
              platform: z.string(),
              url: z.string().url("Must be a valid URL"),
            }),
          ),
        }),
      )
      .optional()
      .default([]),
    sponsors: z
      .array(
        z.object({
          id: z.string(),
          name: z.string().min(1, "Sponsor name is required"),
          sponsorType: z.string().optional(),
          logoUrl: z.string().optional(),
          description: z.string().optional(),
          socialLinks: z
            .array(
              z.object({
                platform: z.string(),
                url: z.string(),
              }),
            )
            .optional(),
        }),
      )
      .optional()
      .default([]),
    galleryImages: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      // If endDate is provided, ensure it's not earlier than startDate
      if (data.endDate && data.startDate) {
        return data.endDate >= data.startDate;
      }
      return true;
    },
    {
      message: "End date cannot be earlier than start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      // If both dates are the same day, ensure endTime is after startTime
      if (
        data.endTime &&
        data.startTime &&
        data.endDate &&
        data.startDate &&
        data.endDate.toDateString() === data.startDate.toDateString()
      ) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "End time must be after start time on the same day",
      path: ["endTime"],
    },
  );

export type EventFormValues = z.infer<typeof eventFormSchema>;
