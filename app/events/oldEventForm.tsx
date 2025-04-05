// To be removed.
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormImageUploader from "./imageUploader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Control,
  Noop,
  RefCallBack,
  useForm,
  UseFormRegister,
} from "react-hook-form";
import * as z from "zod";
import { BASE_URL } from "@/app/api/constants";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Type for individual form field
interface FormFieldType {
  id: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "textarea" | "checkbox";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface TimelineItemType {
  id: string;
  date: Date;
  time: string;
  title: string;
  description?: string;
  speaker?: string;
}

// Type for registration form
interface RegistrationFormType {
  id: string;
  name: string;
  description?: string;
  formFields: FormFieldType[];
  isDefault: boolean;
}

interface SpeakerSocialMedia {
  id: string;
  platform: string;
  url: string;
}

interface EventSpeaker {
  id: string;
  name: string;
  topic: string;
  organization?: string;
  position?: string;
  imageUrl?: string;
  socialMedia: SpeakerSocialMedia[];
}

// Props for the FormFieldConfig component
interface FormFieldConfigProps {
  field: {
    value: FormFieldType;
    register: UseFormRegister<EventFormValues>;
    update: (index: number, newValue: FormFieldType) => void;
  };
  index: number;
  formIndex: number;
  remove: (index: number) => void;
}

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  organizationId: string;
  organizationName?: string;
  eventId?: string; // Optional - present only when editing
  eventName?: string; // Optional - present only when editing
  defaultValues?: Partial<EventFormValues>;
}

const formFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "number", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

const registrationFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Form name is required"),
  description: z.string().optional(),
  formFields: z.array(formFieldSchema),
  isDefault: z.boolean().default(false),
});

// Define the form schema using Zod
const eventFormSchema = z
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
    speakers: z.array(
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
    ),
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

const FormFieldConfig: React.FC<FormFieldConfigProps> = ({
  field,
  index,
  formIndex,
  remove,
}) => {
  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "select", label: "Dropdown" },
    { value: "textarea", label: "Text Area" },
    { value: "checkbox", label: "Checkbox" },
  ];

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Field #{index + 1}</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-2/3 space-y-2">
              <FormLabel>Field Label</FormLabel>
              <Input
                {...field.register(
                  `registrationForms.${formIndex}.formFields.${index}.label`,
                )}
                placeholder="Field label"
              />
            </div>
            <div className="w-1/3 space-y-2">
              <FormLabel>Field Type</FormLabel>
              <Select
                value={field.value.type}
                onValueChange={(value) =>
                  field.update(index, {
                    ...field.value,
                    type: value as
                      | "text"
                      | "email"
                      | "number"
                      | "select"
                      | "textarea"
                      | "checkbox",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-2/3 space-y-2">
              <FormLabel>Placeholder</FormLabel>
              <Input
                {...field.register(
                  `registrationForms.${formIndex}.formFields.${index}.placeholder`,
                )}
                placeholder="Field placeholder text"
              />
            </div>
            <div className="w-1/3 flex items-center pt-6">
              <input
                type="checkbox"
                id={`required-${formIndex}-${index}`}
                {...field.register(
                  `registrationForms.${formIndex}.formFields.${index}.required`,
                )}
                className="mr-2"
              />
              <label htmlFor={`required-${formIndex}-${index}`}>
                Required Field
              </label>
            </div>
          </div>

          {field.value.type === "select" && (
            <div>
              <FormLabel>Options (one per line)</FormLabel>
              <Textarea
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                value={(field.value.options || []).join("\n")}
                onChange={(e) => {
                  const options = e.target.value
                    .split("\n")
                    .filter((o) => o.trim());
                  field.update(index, { ...field.value, options });
                }}
                className="min-h-20"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const TimelineItemConfig: React.FC<{
  item: TimelineItemType;
  index: number;
  update: (index: number, newValue: TimelineItemType) => void;
  remove: (index: number) => void;
}> = ({ item, index, update, remove }) => {
  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Agenda Item #{index + 1}</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !item.date && "text-muted-foreground",
                    )}
                  >
                    {item.date ? (
                      format(item.date, "MM/dd/yyyy")
                    ) : (
                      <span>Select date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={item.date}
                    onSelect={(date) => {
                      if (date) {
                        update(index, { ...item, date });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <FormLabel>Time</FormLabel>
              <Input
                placeholder="e.g. 9:00 AM"
                value={item.time}
                onChange={(e) =>
                  update(index, { ...item, time: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel>Title</FormLabel>
            <Input
              placeholder="e.g. Opening Ceremony"
              value={item.title}
              onChange={(e) =>
                update(index, { ...item, title: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Describe this agenda item"
              value={item.description || ""}
              onChange={(e) =>
                update(index, { ...item, description: e.target.value })
              }
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Speaker (Optional)</FormLabel>
            <Input
              placeholder="e.g. John Doe, CTO at Company"
              value={item.speaker || ""}
              onChange={(e) =>
                update(index, { ...item, speaker: e.target.value })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Component for a single social media input
const SocialMediaInput: React.FC<{
  value: SpeakerSocialMedia;
  index: number;
  speakerIndex: number;
  update: (index: number, newValue: SpeakerSocialMedia) => void;
  remove: (index: number) => void;
  register: UseFormRegister<EventFormValues>;
}> = ({ value, index, speakerIndex, update, remove, register }) => {
  const platforms = [
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "github", label: "GitHub" },
    { value: "website", label: "Website" },
  ];

  return (
    <div className="flex items-center gap-2 mb-2">
      <Select
        value={value.platform}
        onValueChange={(platform) => update(index, { ...value, platform })}
      >
        <SelectTrigger className="w-1/3">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          {platforms.map((platform) => (
            <SelectItem key={platform.value} value={platform.value}>
              {platform.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        placeholder="URL"
        className="flex-1"
        {...register(`speakers.${speakerIndex}.socialMedia.${index}.url`)}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => remove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Component for a single speaker card/form
const SpeakerForm: React.FC<{
  speaker: EventSpeaker;
  index: number;
  update: (index: number, field: string, value: any) => void;
  remove: (index: number) => void;
  register: UseFormRegister<EventFormValues>;
  control: Control<EventFormValues>;
}> = ({ speaker, index, update, remove, register, control }) => {
  // Helper function to update social media
  const updateSocialMedia = (
    socialIndex: number,
    newValue: SpeakerSocialMedia,
  ) => {
    const updatedSocialMedia = [...speaker.socialMedia];
    updatedSocialMedia[socialIndex] = newValue;
    update(index, "socialMedia", updatedSocialMedia);
  };

  // Helper function to remove social media
  const removeSocialMedia = (socialIndex: number) => {
    const updatedSocialMedia = [...speaker.socialMedia];
    updatedSocialMedia.splice(socialIndex, 1);
    update(index, "socialMedia", updatedSocialMedia);
  };

  // Helper function to add new social media
  const addSocialMedia = () => {
    const newSocialMedia = {
      id: crypto.randomUUID(),
      platform: "twitter",
      url: "",
    };
    update(index, "socialMedia", [...speaker.socialMedia, newSocialMedia]);
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Speaker #{index + 1}</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FormLabel htmlFor={`speaker-name-${index}`}>Name*</FormLabel>
            <Input
              id={`speaker-name-${index}`}
              {...register(`speakers.${index}.name`)}
              placeholder="Speaker name"
            />
          </div>

          <div>
            <FormLabel htmlFor={`speaker-topic-${index}`}>
              Speaking Topic*
            </FormLabel>
            <Input
              id={`speaker-topic-${index}`}
              {...register(`speakers.${index}.topic`)}
              placeholder="Topic or session title"
            />
          </div>

          <div>
            <FormLabel htmlFor={`speaker-org-${index}`}>Organization</FormLabel>
            <Input
              id={`speaker-org-${index}`}
              {...register(`speakers.${index}.organization`)}
              placeholder="Company or organization"
            />
          </div>

          <div>
            <FormLabel htmlFor={`speaker-position-${index}`}>
              Position
            </FormLabel>
            <Input
              id={`speaker-position-${index}`}
              {...register(`speakers.${index}.position`)}
              placeholder="Job title or role"
            />
          </div>
        </div>

        <FormField
          control={control}
          name={`speakers.${index}.imageUrl`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <FormImageUploader
                  name={`speaker-image-${index}`}
                  onChange={(file) => field.onChange(file)}
                  required={false}
                  maxSizeMB={1}
                  width={150}
                  height={150}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Social Media</FormLabel>
          </div>

          {speaker.socialMedia.map((social, socialIndex) => (
            <SocialMediaInput
              key={social.id}
              value={social}
              index={socialIndex}
              speakerIndex={index}
              update={updateSocialMedia}
              remove={removeSocialMedia}
              register={register}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={addSocialMedia}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Social Media
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EventForm({
  organizationId,
  organizationName,
  eventId,
  eventName,
  defaultValues,
}: EventFormProps) {
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

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode
          ? `Edit Event - ${eventName}`
          : `Create New Event for ${organizationName}`}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bannerUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Banner</FormLabel>
                <FormControl>
                  <FormImageUploader
                    name="banner"
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
                    <FormLabel>Event Poster</FormLabel>
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

              {/* Start date and time with new implementation */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MM/dd/yyyy hh:mm aa")
                            ) : (
                              <span>Select date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="sm:flex">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const newDate = new Date(
                                  field.value || new Date(),
                                );
                                newDate.setFullYear(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate(),
                                );
                                handleDateSelect(field, newDate);
                                // Also update the startDate field
                                form.setValue("startDate", newDate);
                              }
                            }}
                            initialFocus
                          />
                          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                            <ScrollArea className="w-64 sm:w-auto">
                              <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i + 1)
                                  .reverse()
                                  .map((hour) => (
                                    <Button
                                      key={hour}
                                      size="icon"
                                      variant={
                                        field.value &&
                                        field.value.getHours() % 12 ===
                                          hour % 12
                                          ? "default"
                                          : "ghost"
                                      }
                                      className="sm:w-full shrink-0 aspect-square"
                                      onClick={() =>
                                        handleTimeChange(
                                          field,
                                          "hour",
                                          hour.toString(),
                                        )
                                      }
                                    >
                                      {hour}
                                    </Button>
                                  ))}
                              </div>
                              <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                              />
                            </ScrollArea>
                            <ScrollArea className="w-64 sm:w-auto">
                              <div className="flex sm:flex-col p-2">
                                {Array.from(
                                  { length: 12 },
                                  (_, i) => i * 5,
                                ).map((minute) => (
                                  <Button
                                    key={minute}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      field.value.getMinutes() === minute
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() =>
                                      handleTimeChange(
                                        field,
                                        "minute",
                                        minute.toString(),
                                      )
                                    }
                                  >
                                    {minute.toString().padStart(2, "0")}
                                  </Button>
                                ))}
                              </div>
                              <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                              />
                            </ScrollArea>
                            <ScrollArea className="">
                              <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => (
                                  <Button
                                    key={ampm}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      ((ampm === "AM" &&
                                        field.value.getHours() < 12) ||
                                        (ampm === "PM" &&
                                          field.value.getHours() >= 12))
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() =>
                                      handleTimeChange(field, "ampm", ampm)
                                    }
                                  >
                                    {ampm}
                                  </Button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End date and time with new implementation */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date & Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MM/dd/yyyy hh:mm aa")
                            ) : (
                              <span>Select date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="sm:flex">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                const newDate = new Date(
                                  field.value || new Date(),
                                );
                                newDate.setFullYear(
                                  date.getFullYear(),
                                  date.getMonth(),
                                  date.getDate(),
                                );
                                handleDateSelect(field, newDate);
                                // Also update the endDate field
                                form.setValue("endDate", newDate);

                                // Validate that end date is not before start date
                                const startDate = form.getValues("startDate");
                                if (date < startDate) {
                                  form.setError("endDate", {
                                    type: "manual",
                                    message:
                                      "End date cannot be earlier than start date",
                                  });
                                } else {
                                  form.clearErrors("endDate");
                                }
                              }
                            }}
                            initialFocus
                          />
                          <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                            <ScrollArea className="w-64 sm:w-auto">
                              <div className="flex sm:flex-col p-2">
                                {Array.from({ length: 12 }, (_, i) => i + 1)
                                  .reverse()
                                  .map((hour) => (
                                    <Button
                                      key={hour}
                                      size="icon"
                                      variant={
                                        field.value &&
                                        field.value.getHours() % 12 ===
                                          hour % 12
                                          ? "default"
                                          : "ghost"
                                      }
                                      className="sm:w-full shrink-0 aspect-square"
                                      onClick={() => {
                                        handleTimeChange(
                                          field,
                                          "hour",
                                          hour.toString(),
                                        );
                                        // Validate time if same day
                                        validateEndTime(
                                          form.getValues("startDate"),
                                          form.getValues("startTime"),
                                          field.value,
                                        );
                                      }}
                                    >
                                      {hour}
                                    </Button>
                                  ))}
                              </div>
                              <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                              />
                            </ScrollArea>
                            <ScrollArea className="w-64 sm:w-auto">
                              <div className="flex sm:flex-col p-2">
                                {Array.from(
                                  { length: 12 },
                                  (_, i) => i * 5,
                                ).map((minute) => (
                                  <Button
                                    key={minute}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      field.value.getMinutes() === minute
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() => {
                                      handleTimeChange(
                                        field,
                                        "minute",
                                        minute.toString(),
                                      );
                                      // Validate time if same day
                                      validateEndTime(
                                        form.getValues("startDate"),
                                        form.getValues("startTime"),
                                        field.value,
                                      );
                                    }}
                                  >
                                    {minute.toString().padStart(2, "0")}
                                  </Button>
                                ))}
                              </div>
                              <ScrollBar
                                orientation="horizontal"
                                className="sm:hidden"
                              />
                            </ScrollArea>
                            <ScrollArea className="">
                              <div className="flex sm:flex-col p-2">
                                {["AM", "PM"].map((ampm) => (
                                  <Button
                                    key={ampm}
                                    size="icon"
                                    variant={
                                      field.value &&
                                      ((ampm === "AM" &&
                                        field.value.getHours() < 12) ||
                                        (ampm === "PM" &&
                                          field.value.getHours() >= 12))
                                        ? "default"
                                        : "ghost"
                                    }
                                    className="sm:w-full shrink-0 aspect-square"
                                    onClick={() => {
                                      handleTimeChange(field, "ampm", ampm);
                                      // Validate time if same day
                                      validateEndTime(
                                        form.getValues("startDate"),
                                        form.getValues("startTime"),
                                        field.value,
                                      );
                                    }}
                                  >
                                    {ampm}
                                  </Button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hidden fields for date values */}
              <input type="hidden" {...form.register("startDate")} />
              <input type="hidden" {...form.register("endDate")} />

              <FormField
                control={form.control}
                name="eventMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Mode</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="physical">Physical</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location field - conditional based on event mode */}
              {form.watch("eventMode") !== "online" && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event venue address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Virtual meeting link - for online or hybrid events */}
              {(form.watch("eventMode") === "online" ||
                form.watch("eventMode") === "hybrid") && (
                <FormField
                  control={form.control}
                  name="virtualMeetingLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Virtual Meeting Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Zoom, Google Meet, or other platform link"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
                          const value = e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined;
                          field.onChange(value);
                        }}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Partner Organizations multi-select */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Partner Organizations</h3>
                <FormField
                  control={form.control}
                  name="partnerOrganizations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Partner Organizations</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Select
                            onValueChange={(value) => {
                              // Add the selected value if it's not already in the array
                              const currentValues = Array.isArray(field.value)
                                ? field.value
                                : [];
                              if (!currentValues.includes(value)) {
                                field.onChange([...currentValues, value]);
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select organizations" />
                            </SelectTrigger>
                            <SelectContent>
                              {/* This would be populated from API data in a real implementation */}
                              <SelectItem value="org1">
                                Organization 1
                              </SelectItem>
                              <SelectItem value="org2">
                                Organization 2
                              </SelectItem>
                              <SelectItem value="org3">
                                Organization 3
                              </SelectItem>
                              <SelectItem value="org4">
                                Organization 4
                              </SelectItem>
                              <SelectItem value="org5">
                                Organization 5
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </FormControl>

                      {/* Display selected organizations as badges */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {field.value?.map((org) => (
                          <Badge
                            key={org}
                            variant="secondary"
                            className="flex items-center gap-2 p-2"
                          >
                            {org}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => {
                                field.onChange(
                                  field.value.filter((item) => item !== org),
                                );
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="bg-violet-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-violet-700">
                  <p className="text-xs text-violet-300 text-muted-foreground">
                    Partner organizations will be displayed on your event page
                    and can help promote your event to their members.
                  </p>
                </div>
              </div>
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

              {/* 
                Tabs section (optional fields)
                 - Registration Form
                 - Timeline (Agenda)
                 - Speaker lineup
                 - Sponsors lineup
                 - Pictures 
              */}
              <Tabs defaultValue="forms" className="my-6 w-full min-w-xl">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="forms">Form</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="speakers">Speakers</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                  <TabsTrigger value="pictures">Pictures</TabsTrigger>
                </TabsList>
                <TabsContent value="forms">
                  {/* Registration */}
                  <div className="w-full mt-2">
                    <div className="bg-violet-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-violet-700">
                      <h3 className="text-md text-violet-300 font-semibold mb-2">
                        Registration Forms
                      </h3>
                      <p className="text-xs text-violet-300 text-muted-foreground">
                        Customize the information you want to collect from
                        different types of registrants. Participant registration
                        is required, but you can add additional forms for other
                        roles.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="registrationForms"
                      render={({ field }) => (
                        <FormItem>
                          <Accordion
                            type="multiple"
                            className="w-full"
                            defaultValue={["participant"]}
                          >
                            {field.value.map((registrationForm, formIndex) => (
                              <AccordionItem
                                key={registrationForm.id || formIndex}
                                value={
                                  registrationForm.isDefault
                                    ? "participant"
                                    : registrationForm.id
                                }
                                className="border-b w-full"
                              >
                                <div className="flex justify-between items-center w-full">
                                  <AccordionTrigger className="py-4 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span>{registrationForm.name}</span>
                                      {registrationForm.isDefault && (
                                        <Badge variant="secondary">
                                          Default
                                        </Badge>
                                      )}
                                    </div>
                                  </AccordionTrigger>

                                  {!registrationForm.isDefault && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        // Prevent event from bubbling up to the AccordionTrigger
                                        e.stopPropagation();
                                        // Remove this form
                                        const updatedForms = [...field.value];
                                        updatedForms.splice(formIndex, 1);
                                        field.onChange(updatedForms);
                                      }}
                                      className="mr-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <AccordionContent className="pb-4 pt-2">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`registrationForms.${formIndex}.name`}
                                        render={({ field: nameField }) => (
                                          <FormItem>
                                            <FormLabel>Form Name</FormLabel>
                                            <FormControl>
                                              <Input
                                                {...nameField}
                                                placeholder="e.g. Participant, Speaker, Volunteer"
                                                disabled={
                                                  registrationForm.isDefault
                                                }
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`registrationForms.${formIndex}.description`}
                                        render={({ field: descField }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Form Description (Optional)
                                            </FormLabel>
                                            <FormControl>
                                              <Input
                                                {...descField}
                                                placeholder="Short description of this registration type"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>

                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Form Fields
                                      </h4>
                                      {/* Display existing form fields */}
                                      {(
                                        form.watch(
                                          `registrationForms.${formIndex}.formFields`,
                                        ) || []
                                      ).map((fieldValue, fieldIndex) => (
                                        <FormFieldConfig
                                          key={fieldValue.id || fieldIndex}
                                          field={{
                                            value: fieldValue,
                                            register: form.register,
                                            update: (idx, newValue) => {
                                              const fields = [
                                                ...form.getValues(
                                                  `registrationForms.${formIndex}.formFields`,
                                                ),
                                              ];
                                              fields[idx] = newValue;
                                              form.setValue(
                                                `registrationForms.${formIndex}.formFields`,
                                                fields,
                                              );
                                            },
                                          }}
                                          index={fieldIndex}
                                          formIndex={formIndex}
                                          remove={() => {
                                            const fields = [
                                              ...form.getValues(
                                                `registrationForms.${formIndex}.formFields`,
                                              ),
                                            ];
                                            fields.splice(fieldIndex, 1);
                                            form.setValue(
                                              `registrationForms.${formIndex}.formFields`,
                                              fields,
                                            );
                                          }}
                                        />
                                      ))}

                                      {/* Add new field button */}
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full mt-2"
                                        onClick={() => {
                                          const newField: FormFieldType = {
                                            id: crypto.randomUUID(),
                                            label: "",
                                            type: "text",
                                            required: false,
                                            placeholder: "",
                                          };
                                          const currentFields =
                                            form.getValues(
                                              `registrationForms.${formIndex}.formFields`,
                                            ) || [];
                                          form.setValue(
                                            `registrationForms.${formIndex}.formFields`,
                                            [...currentFields, newField],
                                          );
                                        }}
                                      >
                                        <PlusCircle className="h-4 w-4 mr-2" />
                                        Add Field
                                      </Button>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            ))}
                          </Accordion>

                          {/* Add new registration form button */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => {
                              const newForm = {
                                id: crypto.randomUUID(),
                                name: "New Form",
                                description: "",
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
                                isDefault: false,
                              };
                              field.onChange([...field.value, newForm]);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Registration Form
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="timeline">
                  <div className="w-full mt-2">
                    <div className="bg-blue-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-blue-700">
                      <h3 className="text-md text-blue-300 font-semibold mb-2">
                        Event Timeline / Agenda
                      </h3>
                      <p className="text-xs text-blue-300 text-muted-foreground">
                        Add items to your event schedule to give attendees a
                        clear overview of what to expect. Include session
                        titles, times, descriptions, and speakers if applicable.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="timelineItems"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <div className="space-y-4">
                            {/* Display existing timeline items */}
                            {(field.value || []).map((item, index) => (
                              <TimelineItemConfig
                                key={item.id || index}
                                item={item}
                                index={index}
                                update={(idx, newValue) => {
                                  const items = [...(field.value || [])];
                                  items[idx] = newValue;
                                  field.onChange(items);
                                }}
                                remove={(idx) => {
                                  const items = [...(field.value || [])];
                                  items.splice(idx, 1);
                                  field.onChange(items);
                                }}
                              />
                            ))}

                            {/* Button to add new timeline item */}
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full mt-2"
                              onClick={() => {
                                const newItem: TimelineItemType = {
                                  id: crypto.randomUUID(),
                                  date: new Date(form.getValues("startDate")),
                                  time: "",
                                  title: "",
                                  description: "",
                                };
                                field.onChange([
                                  ...(field.value || []),
                                  newItem,
                                ]);
                              }}
                            >
                              <PlusCircle className="h-4 w-4 mr-2" />
                              Add Agenda Item
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="speakers">
                  <div className="w-full mt-2">
                    <div className="bg-blue-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-blue-700">
                      <h3 className="text-md text-blue-300 font-semibold mb-2">
                        Event Speakers
                      </h3>
                      <p className="text-xs text-blue-300 text-muted-foreground">
                        Add profiles for speakers who will be presenting at your
                        event. This information will be displayed on your event
                        page.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="speakers"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          {field.value?.map((speaker, index) => (
                            <SpeakerForm
                              key={speaker.id}
                              speaker={speaker}
                              index={index}
                              update={(speakerIndex, fieldName, value) => {
                                const updatedSpeakers = [...field.value];
                                updatedSpeakers[speakerIndex] = {
                                  ...updatedSpeakers[speakerIndex],
                                  [fieldName]: value,
                                };
                                field.onChange(updatedSpeakers);
                              }}
                              remove={(speakerIndex) => {
                                const updatedSpeakers = [...field.value];
                                updatedSpeakers.splice(speakerIndex, 1);
                                field.onChange(updatedSpeakers);
                              }}
                              register={form.register}
                              control={form.control}
                            />
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => {
                              const newSpeaker: EventSpeaker = {
                                id: crypto.randomUUID(),
                                name: "",
                                topic: "",
                                organization: "",
                                position: "",
                                imageUrl: "",
                                socialMedia: [],
                              };
                              field.onChange([
                                ...(field.value || []),
                                newSpeaker,
                              ]);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Speaker
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="sponsors">
                  <div className="w-full mt-2">
                    <div className="bg-amber-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-amber-700">
                      <h3 className="text-md text-amber-300 font-semibold mb-2">
                        Event Sponsors
                      </h3>
                      <p className="text-xs text-amber-300 text-muted-foreground">
                        Add details about organizations sponsoring your event,
                        whether they're providing monetary support, venue, food,
                        or other resources.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="sponsors"
                      render={({ field }) => (
                        <FormItem>
                          <Accordion type="multiple" className="w-full mt-4">
                            {(field.value || []).map(
                              (sponsor, sponsorIndex) => (
                                <AccordionItem
                                  key={sponsor.id || sponsorIndex}
                                  value={
                                    sponsor.id || `sponsor-${sponsorIndex}`
                                  }
                                  className="border-b w-full"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <AccordionTrigger className="py-4 flex-1">
                                      <div className="flex items-center gap-2">
                                        <span>
                                          {sponsor.name ||
                                            `Sponsor #${sponsorIndex + 1}`}
                                        </span>
                                        {sponsor.sponsorType && (
                                          <Badge variant="outline">
                                            {sponsor.sponsorType}
                                          </Badge>
                                        )}
                                      </div>
                                    </AccordionTrigger>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        // Prevent event from bubbling up to the AccordionTrigger
                                        e.stopPropagation();
                                        // Remove this sponsor
                                        const updatedSponsors = [
                                          ...field.value,
                                        ];
                                        updatedSponsors.splice(sponsorIndex, 1);
                                        field.onChange(updatedSponsors);
                                      }}
                                      className="mr-2"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <AccordionContent className="pb-4 pt-2">
                                    <div className="space-y-4">
                                      {/* Sponsor Details */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                          control={form.control}
                                          name={`sponsors.${sponsorIndex}.name`}
                                          render={({ field: nameField }) => (
                                            <FormItem>
                                              <FormLabel>
                                                Organization Name
                                              </FormLabel>
                                              <FormControl>
                                                <Input
                                                  {...nameField}
                                                  placeholder="Organization name"
                                                />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`sponsors.${sponsorIndex}.sponsorType`}
                                          render={({ field: typeField }) => (
                                            <FormItem>
                                              <FormLabel>
                                                Sponsorship Type
                                              </FormLabel>
                                              <Select
                                                onValueChange={
                                                  typeField.onChange
                                                }
                                                defaultValue={typeField.value}
                                              >
                                                <FormControl>
                                                  <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                  </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                  <SelectItem value="financial">
                                                    Financial
                                                  </SelectItem>
                                                  <SelectItem value="venue">
                                                    Venue Provider
                                                  </SelectItem>
                                                  <SelectItem value="food">
                                                    Food & Beverages
                                                  </SelectItem>
                                                  <SelectItem value="technology">
                                                    Technology
                                                  </SelectItem>
                                                  <SelectItem value="media">
                                                    Media Partner
                                                  </SelectItem>
                                                  <SelectItem value="other">
                                                    Other
                                                  </SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      {/* Logo upload */}
                                      <FormField
                                        control={form.control}
                                        name={`sponsors.${sponsorIndex}.logoUrl`}
                                        render={({ field: logoField }) => (
                                          <FormItem>
                                            <FormLabel>
                                              Organization Logo
                                            </FormLabel>
                                            <FormControl>
                                              <FormImageUploader
                                                name={`sponsor-logo-${sponsorIndex}`}
                                                onChange={(file) =>
                                                  logoField.onChange(file)
                                                }
                                                required={false}
                                                maxSizeMB={1}
                                                width={200}
                                                height={200}
                                                scaleDesc="Square format recommended"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      {/* Description */}
                                      <FormField
                                        control={form.control}
                                        name={`sponsors.${sponsorIndex}.description`}
                                        render={({ field: descField }) => (
                                          <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                              <Textarea
                                                {...descField}
                                                placeholder="Brief description of the sponsor and their contribution"
                                                className="min-h-20"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      {/* Social Media Links */}
                                      <div className="space-y-2">
                                        <FormLabel>
                                          Social Media Links
                                        </FormLabel>
                                        {(
                                          field.value[sponsorIndex]
                                            ?.socialLinks || []
                                        ).length > 0 ? (
                                          <div className="space-y-2">
                                            {(
                                              field.value[sponsorIndex]
                                                ?.socialLinks || []
                                            ).map((link, linkIndex) => (
                                              <div
                                                key={linkIndex}
                                                className="flex gap-2"
                                              >
                                                <FormField
                                                  control={form.control}
                                                  name={`sponsors.${sponsorIndex}.socialLinks.${linkIndex}.platform`}
                                                  render={({
                                                    field: platformField,
                                                  }) => (
                                                    <FormItem className="flex-1">
                                                      <Select
                                                        onValueChange={
                                                          platformField.onChange
                                                        }
                                                        defaultValue={
                                                          platformField.value
                                                        }
                                                      >
                                                        <FormControl>
                                                          <SelectTrigger>
                                                            <SelectValue placeholder="Platform" />
                                                          </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                          <SelectItem value="website">
                                                            Website
                                                          </SelectItem>
                                                          <SelectItem value="linkedin">
                                                            LinkedIn
                                                          </SelectItem>
                                                          <SelectItem value="twitter">
                                                            Twitter
                                                          </SelectItem>
                                                          <SelectItem value="facebook">
                                                            Facebook
                                                          </SelectItem>
                                                          <SelectItem value="instagram">
                                                            Instagram
                                                          </SelectItem>
                                                          <SelectItem value="other">
                                                            Other
                                                          </SelectItem>
                                                        </SelectContent>
                                                      </Select>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <FormField
                                                  control={form.control}
                                                  name={`sponsors.${sponsorIndex}.socialLinks.${linkIndex}.url`}
                                                  render={({
                                                    field: urlField,
                                                  }) => (
                                                    <FormItem className="flex-[3]">
                                                      <FormControl>
                                                        <Input
                                                          {...urlField}
                                                          placeholder="URL"
                                                        />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() => {
                                                    const currentLinks = [
                                                      ...(field.value[
                                                        sponsorIndex
                                                      ].socialLinks || []),
                                                    ];
                                                    currentLinks.splice(
                                                      linkIndex,
                                                      1,
                                                    );
                                                    const updatedSponsors = [
                                                      ...field.value,
                                                    ];
                                                    updatedSponsors[
                                                      sponsorIndex
                                                    ] = {
                                                      ...updatedSponsors[
                                                        sponsorIndex
                                                      ],
                                                      socialLinks: currentLinks,
                                                    };
                                                    field.onChange(
                                                      updatedSponsors,
                                                    );
                                                  }}
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-sm text-muted-foreground">
                                            No social links added yet.
                                          </p>
                                        )}

                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="sm"
                                          className="mt-2"
                                          onClick={() => {
                                            const currentSponsor =
                                              field.value[sponsorIndex];
                                            const currentLinks =
                                              currentSponsor.socialLinks || [];
                                            const updatedSponsors = [
                                              ...field.value,
                                            ];
                                            updatedSponsors[sponsorIndex] = {
                                              ...currentSponsor,
                                              socialLinks: [
                                                ...currentLinks,
                                                {
                                                  platform: "website",
                                                  url: "",
                                                },
                                              ],
                                            };
                                            field.onChange(updatedSponsors);
                                          }}
                                        >
                                          <PlusCircle className="h-4 w-4 mr-2" />
                                          Add Social Link
                                        </Button>
                                      </div>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              ),
                            )}
                          </Accordion>

                          {/* Add new sponsor button */}
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => {
                              const newSponsor = {
                                id: crypto.randomUUID(),
                                name: "",
                                sponsorType: "financial",
                                logoUrl: "",
                                description: "",
                                socialLinks: [],
                              };
                              field.onChange([
                                ...(field.value || []),
                                newSponsor,
                              ]);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Sponsor
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="pictures">
                  <div className="w-full mt-2">
                    <div className="bg-emerald-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-emerald-700">
                      <h3 className="text-md text-emerald-300 font-semibold mb-2">
                        Event Gallery Images
                      </h3>
                      <p className="text-xs text-emerald-300 text-muted-foreground">
                        Upload additional images for your event gallery. These
                        will be displayed in a carousel on your event page. You
                        can upload up to 10 images.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="galleryImages"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 w-full">
                            {Array.from({
                              length: Math.min(
                                10,
                                (field.value?.length || 0) + 1,
                              ),
                            }).map((_, index) => (
                              <div key={index} className="w-full">
                                <FormImageUploader
                                  name={`gallery-image-${index}`}
                                  onChange={(file) => {
                                    const currentImages = [
                                      ...(field.value || []),
                                    ];
                                    // Check if file is not null before assigning
                                    if (file) {
                                      if (index < currentImages.length) {
                                        // Replace existing image
                                        currentImages[index] = file;
                                      } else {
                                        // Add new image
                                        currentImages.push(file);
                                      }
                                      field.onChange(currentImages);
                                    }
                                  }}
                                  required={false}
                                  maxSizeMB={2}
                                  height={200}
                                  scaleDesc="1200px x 800px recommended"
                                  value={field.value?.[index] || ""}
                                  className="w-full h-48"
                                />
                                {field.value?.[index] && (
                                  <div className="p-2 flex justify-end">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const currentImages = [
                                          ...(field.value || []),
                                        ];
                                        currentImages.splice(index, 1);
                                        field.onChange(currentImages);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Hidden field for organizationId */}
          <input type="hidden" {...form.register("organizationId")} />

          {/* Submit */}
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
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Event"
                  : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
