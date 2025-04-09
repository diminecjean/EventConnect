import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UserProfileFormValues } from "./schemas";

interface UserProfileBioFieldProps {
  control: Control<UserProfileFormValues>;
}

export function UserProfileBioField({ control }: UserProfileBioFieldProps) {
  return (
    <FormField
      control={control}
      name="bio"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Bio</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Tell us about yourself"
              className="min-h-[120px]"
              {...field}
              value={field.value || ""}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
