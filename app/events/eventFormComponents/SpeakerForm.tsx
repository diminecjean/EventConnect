import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EventSpeaker, SpeakerSocialMedia } from "./types";
import { SocialMediaInput } from "./SocialMediaInput";
import { Control, UseFormRegister } from "react-hook-form";
import { EventFormValues } from "./schemas";
import FormImageUploader from "../imageUploader";

type SpeakerFormProps = {
  speaker: EventSpeaker;
  index: number;
  update: (index: number, field: string, value: any) => void;
  remove: (index: number) => void;
  register: UseFormRegister<EventFormValues>;
  control: Control<EventFormValues>;
};

export const SpeakerForm: React.FC<SpeakerFormProps> = ({
  speaker,
  index,
  update,
  remove,
  register,
  control,
}) => {
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
