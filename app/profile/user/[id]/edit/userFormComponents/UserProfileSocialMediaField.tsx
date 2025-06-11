import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Globe,
  Facebook,
} from "lucide-react";
import { UserProfileFormValues } from "./schemas";

interface UserProfileSocialMediaFieldProps {
  control: Control<UserProfileFormValues>;
}

export function UserProfileSocialMediaField({
  control,
}: UserProfileSocialMediaFieldProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Social Media Links</h3>
      <FormDescription>
        Add links to your social media profiles (all fields are optional)
      </FormDescription>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          control={control}
          name="socialMedia.linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Linkedin size={16} className="text-blue-500" />
                LinkedIn
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://linkedin.com/in/username"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="socialMedia.twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Twitter size={16} className="text-blue-400" />
                Twitter
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://twitter.com/username"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="socialMedia.instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Instagram size={16} className="text-pink-500" />
                Instagram
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://instagram.com/username"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="socialMedia.github"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Github size={16} className="text-gray-400" />
                GitHub
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/username"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="socialMedia.facebook"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Facebook size={16} className="text-blue-600" />
                Facebook
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://facebook.com/username"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="socialMedia.website"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Globe size={16} className="text-green-500" />
                Website
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
