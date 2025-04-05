import React from "react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Control, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../schemas";
import { TimelineItemConfig } from "../TimelineItemConfig";
import { TimelineItemType } from "../types";

interface TimelineTabContentProps {
  form: UseFormReturn<EventFormValues>;
  control: Control<EventFormValues>;
  getValues: any;
  setValue: any;
  register: any;
  watch: any;
}
export const TimelineTabContent: React.FC<TimelineTabContentProps> = ({
  form,
  control,
  getValues,
  setValue,
  register,
  watch,
}) => {
  return (
    <div className="w-full mt-2">
      <div className="bg-blue-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-blue-700">
        <h3 className="text-md text-blue-300 font-semibold mb-2">
          Event Timeline / Agenda
        </h3>
        <p className="text-xs text-blue-300 text-muted-foreground">
          Add items to your event schedule to give attendees a clear overview of
          what to expect. Include session titles, times, descriptions, and
          speakers if applicable.
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
                  field.onChange([...(field.value || []), newItem]);
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
  );
};
