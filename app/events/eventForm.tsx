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
import { PictureTabContent } from "./eventFormComponents/eventFormTabs/PicturesTabContent";
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

export default function EventForm({
  organizationId,
  organizationName,
  eventId,
  eventName,
  defaultValues,
}: EventFormProps) {
  const router = useRouter();
  const {
    form,
    onSubmit,
    isSubmitting,
    isEditMode,
    handleDateSelect,
    handleTimeChange,
    validateEndTime,
    combineDateAndTime,
  } = useEventForm({
    organizationId,
    eventId,
    defaultValues,
  });

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
                <TabsContent value="pictures">
                  <PictureTabContent
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
          </div>
        </form>
      </Form>
    </div>
  );
}
