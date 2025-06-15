import { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Linkedin,
  Twitter,
  Instagram,
  Github,
  Globe,
  Facebook,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OrganizationProfileFormValues } from "./schemas";
import Image from "next/image";
import FormImageUploader from "@/app/events/imageUploader";

interface FormFieldProps {
  control: Control<OrganizationProfileFormValues>;
}

// Organization Name Field Component
export function OrganizationNameField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Organization Name</FormLabel>
          <FormControl>
            <Input placeholder="Enter organization name" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Organization Description Field Component
export function OrganizationDescriptionField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Describe your organization"
              className="min-h-[100px]"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Organization Location Field Component
export function OrganizationLocationField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Input placeholder="Location (city, country)" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Organization Logo Field Component using FormImageUploader
export function OrganizationLogoField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="logo"
      render={({ field: { value, onChange, ...fieldProps } }) => {
        const previewUrl =
          typeof value === "string" && value ? value : undefined;

        return (
          <FormItem>
            <FormLabel>Organization Logo</FormLabel>
            <FormControl>
              <FormImageUploader
                name="logoUploader"
                label="Upload Organization Logo"
                onChange={onChange}
                value={value}
                maxSizeMB={5}
                width={180}
                height={180}
                scaleDesc="Recommended size: 150x150 pixels"
                previewUrl={previewUrl}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Organization Banner Field Component using FormImageUploader
export function OrganizationBannerField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="banner"
      render={({ field: { value, onChange, ...fieldProps } }) => {
        const previewUrl =
          typeof value === "string" && value ? value : undefined;

        return (
          <FormItem>
            <FormLabel>Organization Banner</FormLabel>
            <FormControl>
              <FormImageUploader
                name="bannerUploader"
                label="Upload Organization Banner"
                onChange={onChange}
                value={value}
                maxSizeMB={10}
                width="100%"
                height={200}
                scaleDesc="Recommended size: 1200x300 pixels (wide banner)"
                previewUrl={previewUrl}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

// Organization Website Field Component
export function OrganizationWebsiteField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="website"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Website</FormLabel>
          <FormControl>
            <Input placeholder="https://yourwebsite.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Organization Contact Email Field Component
export function OrganizationContactEmailField({ control }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="contactEmail"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact Email</FormLabel>
          <FormControl>
            <Input
              placeholder="contact@organization.com"
              type="email"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function OrganizationSocialMediaField({ control }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Social Media Links</h3>
      <FormDescription>
        Add links to your social media profiles (all fields are optional)
      </FormDescription>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField
          control={control}
          name="socialLinks.linkedin"
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
          name="socialLinks.twitter"
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
          name="socialLinks.instagram"
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
          name="socialLinks.github"
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
          name="socialLinks.facebook"
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
          name="socialLinks.website"
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
