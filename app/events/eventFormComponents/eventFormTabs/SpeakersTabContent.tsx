import React from "react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Control, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../schemas";
import { EventSpeaker } from "../types";
import { SpeakerForm } from "../SpeakerForm";

interface SpeakerTabContentProps {
  form: UseFormReturn<EventFormValues>;
  control: Control<EventFormValues>;
  getValues: any;
  setValue: any;
  register: any;
  watch: any;
}

export const SpeakersTabContent: React.FC<SpeakerTabContentProps> = ({
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
          Event Speakers
        </h3>
        <p className="text-xs text-blue-300 text-muted-foreground">
          Add profiles for speakers who will be presenting at your event. This
          information will be displayed on your event page.
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

                  // If value is an object with multiple fields (for bulk update)
                  if (typeof fieldName === "object" && fieldName !== null) {
                    updatedSpeakers[speakerIndex] = {
                      ...updatedSpeakers[speakerIndex],
                      ...(fieldName as Record<string, unknown>),
                    };
                  } else {
                    // Regular single field update
                    updatedSpeakers[speakerIndex] = {
                      ...updatedSpeakers[speakerIndex],
                      [fieldName as string]: value,
                    };
                  }

                  field.onChange(updatedSpeakers);
                }}
                remove={(speakerIndex) => {
                  const updatedSpeakers = [...field.value];
                  updatedSpeakers.splice(speakerIndex, 1);
                  field.onChange(updatedSpeakers);
                }}
                register={form.register}
                control={form.control}
                form={form}
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
                field.onChange([...(field.value || []), newSpeaker]);
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
  );
};
