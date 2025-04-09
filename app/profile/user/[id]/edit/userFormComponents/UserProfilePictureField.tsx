import { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import FormImageUploader from "@/app/events/imageUploader";
import { UserProfileFormValues } from "./schemas";

interface UserProfilePictureFieldProps {
  control: Control<UserProfileFormValues>;
}

export function UserProfilePictureField({
  control,
}: UserProfilePictureFieldProps) {
  return (
    <FormField
      control={control}
      name="profilePicture"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Profile Picture</FormLabel>
          <FormControl>
            <FormImageUploader
              name="profilePicture"
              value={field.value || ""}
              onChange={field.onChange}
              previewUrl={
                typeof field.value === "string" ? field.value : undefined
              }
              width="200px"
              height="200px"
              scaleDesc="Recommended size: 200x200 pixels"
              maxSizeMB={2}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
