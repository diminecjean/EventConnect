"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FormImageUploader from "./imageUploader";
import { useEventForm } from "./hooks/useEventForm";
import { FormTabContent } from "./eventFormComponents/eventFormTabs/FormTabContent";
import { TimelineTabContent } from "./eventFormComponents/eventFormTabs/TimelineTabContent";
import { SpeakersTabContent } from "./eventFormComponents/eventFormTabs/SpeakersTabContent";
import { SponsorsTabContent } from "./eventFormComponents/eventFormTabs/SponsorsTabContent";
import { MaterialTabContent } from "./eventFormComponents/eventFormTabs/MaterialTabContent";
import { EventFormProps } from "./eventFormComponents/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { CalendarIcon, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Noop, RefCallBack } from "react-hook-form";
import PartnerOrganizationsField from "./eventFormComponents/PartnerOrgSelector";

export default function EventForm({
  organizationId,
  organizationName,
  eventId,
  eventName,
  defaultValues,
}: EventFormProps) {
  const router = useRouter();
  const { form, onSubmit, isSubmitting, isEditMode } = useEventForm({
    organizationId,
    eventId,
    defaultValues,
  });

  // For debugging purposes
  const { touchedFields, dirtyFields } = form.formState;

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

    // Update the field WITHOUT triggering validation on the rest of the form
    field.onChange(newDate);

    // Handle specific fields - similar pattern to what's already in your date selection
    if (field.name === "startTime") {
      // Update the startDate field in the background without triggering validation
      form.setValue("startDate", new Date(newDate), { shouldValidate: false });
    } else if (field.name === "endTime") {
      // Update the endDate field in the background without triggering validation
      form.setValue("endDate", new Date(newDate), { shouldValidate: false });

      // Only validate the specific time relationship if needed
      if (form.getValues("startDate")) {
        // Modify validateEndTime to only set error on endTime, not validate entire form
        const startTime = form.getValues("startTime");
        const startDate = form.getValues("startDate");

        if (startDate && startTime && newDate) {
          // Check if same day
          const sameDay =
            startDate.getFullYear() === newDate.getFullYear() &&
            startDate.getMonth() === newDate.getMonth() &&
            startDate.getDate() === newDate.getDate();

          if (sameDay) {
            const startHours = startTime.getHours();
            const startMinutes = startTime.getMinutes();
            const endHours = newDate.getHours();
            const endMinutes = newDate.getMinutes();

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
        }
      }
    }
  };

  // Helper function to validate end time on the same day - can be simplified
  const validateEndTime = (
    startDate: Date,
    startTime: Date,
    endTime?: Date,
  ) => {
    // You can now use this only for explicit validation without affecting other fields
    if (!startDate || !startTime || !endTime) return;

    // Check if it's the same day
    const sameDay =
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
        return {
          isValid: false,
          message: "End time must be after start time on the same day",
        };
      }
    }

    return { isValid: true };
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
                    onChange={(file) => {
                      console.log("Banner changed:", file);
                      field.onChange(file);
                    }}
                    value={field.value} // Pass the current value directly
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
                        onChange={(file) => {
                          console.log("Image changed:", file);
                          field.onChange(file);
                        }}
                        value={field.value} // Pass the current value directly
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
                        <div className="sm:flex bg-black">
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
                                // console.log({ startDate: newDate });
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
                        <div className="sm:flex bg-black">
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
                                console.log({ endDate: newDate });

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
              <PartnerOrganizationsField
                control={form.control}
                name="partnerOrganizations"
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

              {/* Tags Input Field */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input
                            placeholder="Add tags (press Enter to add)"
                            id="tag-input"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const input = e.currentTarget;
                                const value = input.value.trim();

                                if (value) {
                                  // Check if this tag text already exists
                                  const tagExists = field.value?.some((tag) =>
                                    typeof tag === "object"
                                      ? tag.label === value
                                      : tag === value,
                                  );

                                  if (!tagExists) {
                                    // Generate a random color class
                                    const colors = [
                                      "bg-blue-100",
                                      "bg-purple-100",
                                      "bg-green-100",
                                      "bg-yellow-100",
                                      "bg-orange-100",
                                      "bg-pink-100",
                                      "bg-indigo-100",
                                      "bg-red-100",
                                      "bg-teal-100",
                                    ];
                                    const randomColor =
                                      colors[
                                        Math.floor(
                                          Math.random() * colors.length,
                                        )
                                      ];

                                    // Create tag object
                                    const newTag = {
                                      label: value,
                                      color: randomColor,
                                    };

                                    const newTags = [
                                      ...(field.value || []),
                                      newTag,
                                    ];
                                    field.onChange(newTags);
                                    input.value = "";
                                  }
                                }
                              }
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.getElementById(
                              "tag-input",
                            ) as HTMLInputElement;
                            const value = input.value.trim();

                            if (value) {
                              // Check if this tag text already exists
                              const tagExists = field.value?.some((tag) =>
                                typeof tag === "object"
                                  ? tag.label === value
                                  : tag === value,
                              );

                              if (!tagExists) {
                                // Generate a random color class
                                const colors = [
                                  "bg-blue-100",
                                  "bg-purple-100",
                                  "bg-green-100",
                                  "bg-yellow-100",
                                  "bg-orange-100",
                                  "bg-pink-100",
                                  "bg-indigo-100",
                                  "bg-red-100",
                                  "bg-teal-100",
                                ];
                                const randomColor =
                                  colors[
                                    Math.floor(Math.random() * colors.length)
                                  ];

                                // Create tag object
                                const newTag = {
                                  label: value,
                                  color: randomColor,
                                };

                                const newTags = [
                                  ...(field.value || []),
                                  newTag,
                                ];
                                field.onChange(newTags);
                                input.value = "";
                              }
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>

                      {Array.isArray(field.value) && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 pt-4">
                          {field.value.map((tag: any, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={`py-1 px-2 flex items-center gap-1 ${
                                typeof tag === "object" && tag.color
                                  ? tag.color
                                  : "bg-gray-100"
                              }`}
                            >
                              {typeof tag === "object" ? tag.label : tag}
                              <Trash2
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  const newTags = (field.value || []).filter(
                                    (_: any, i: number) => i !== index,
                                  );
                                  field.onChange(newTags);
                                }}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
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
                 - Materials 
              */}
              <Tabs defaultValue="forms" className="my-6 w-full min-w-xl">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="forms">Form</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="speakers">Speakers</TabsTrigger>
                  <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                <TabsContent value="forms">
                  <FormTabContent
                    form={form}
                    control={form.control}
                    getValues={form.getValues}
                    setValue={form.setValue}
                    register={form.register}
                    watch={form.watch}
                  />
                </TabsContent>
                <TabsContent value="timeline">
                  <TimelineTabContent
                    form={form}
                    control={form.control}
                    getValues={form.getValues}
                    setValue={form.setValue}
                    register={form.register}
                    watch={form.watch}
                  />
                </TabsContent>
                <TabsContent value="speakers">
                  <SpeakersTabContent
                    form={form}
                    control={form.control}
                    getValues={form.getValues}
                    setValue={form.setValue}
                    register={form.register}
                    watch={form.watch}
                  />
                </TabsContent>
                <TabsContent value="sponsors">
                  <SponsorsTabContent
                    form={form}
                    control={form.control}
                    getValues={form.getValues}
                    setValue={form.setValue}
                    register={form.register}
                    watch={form.watch}
                  />
                </TabsContent>
                <TabsContent value="materials">
                  <MaterialTabContent
                    form={form}
                    control={form.control}
                    getValues={form.getValues}
                    setValue={form.setValue}
                    register={form.register}
                    watch={form.watch}
                  />
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
            {/* <Button
              type="button"
              onClick={() => {
                console.log("Touched fields:", touchedFields);
                console.log("Dirty fields:", dirtyFields);
                console.log("Form values:", form.getValues());
                console.log("Form errors:", form.formState.errors);
              }}
            >
              Check Validation State
            </Button> */}
            {/* <Button
              type="button"
              onClick={() => {
                console.log("Form values:", form.getValues());
                console.log("Form errors:", form.formState.errors);
                console.log("Form is valid:", form.formState.isValid);

                // Try to submit the form programmatically
                form.handleSubmit((data) => {
                  console.log("Submit handler called with data:", data);
                  onSubmit(data);
                })();
              }}
              disabled={isSubmitting}
            >
              Debug Submit
            </Button> */}
          </div>
        </form>
      </Form>
    </div>
  );
}
