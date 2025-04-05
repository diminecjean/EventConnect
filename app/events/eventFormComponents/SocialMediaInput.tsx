// SocialMediaInput.tsx
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SpeakerSocialMedia } from "./types";
import { UseFormRegister } from "react-hook-form";
import { EventFormValues } from "./schemas";

interface SocialMediaInputProps {
  value: SpeakerSocialMedia;
  index: number;
  speakerIndex: number;
  update: (index: number, newValue: SpeakerSocialMedia) => void;
  remove: (index: number) => void;
  register: UseFormRegister<EventFormValues>;
}

export const SocialMediaInput: React.FC<SocialMediaInputProps> = ({
  value,
  index,
  speakerIndex,
  update,
  remove,
  register,
}) => {
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
