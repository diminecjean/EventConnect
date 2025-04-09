"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { BASE_URL } from "@/app/api/constants";
import {
  userProfileFormSchema,
  UserProfileFormValues,
} from "./userFormComponents/schemas";
import { UserProfileNameField } from "./userFormComponents//UserProfileNameField";
import { UserProfileBioField } from "./userFormComponents/UserProfileBioField";
import { UserProfilePictureField } from "./userFormComponents/UserProfilePictureField";
import { UserProfileInterestsField } from "./userFormComponents/UserProfileInterestsField";
import { uploadImageToSupabase } from "@/app/utils/supabase/imageUploadUtil";

interface UserProfileFormProps {
  userId: string;
  defaultValues: Partial<UserProfileFormValues>;
}

export default function UserProfileForm({
  userId,
  defaultValues,
}: UserProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      name: defaultValues.name || "",
      bio: defaultValues.bio || "",
      profilePicture: defaultValues.profilePicture || "",
      interests: defaultValues.interests || [],
    },
  });

  async function onSubmit(data: UserProfileFormValues) {
    try {
      setIsSubmitting(true);

      let profilePictureUrl = data.profilePicture;

      // If the profile picture is a File, upload it and get the URL first
      if (data.profilePicture instanceof File) {
        try {
          profilePictureUrl = await uploadImageToSupabase(
            data.profilePicture,
            "profilePicture",
          );
        } catch (uploadError) {
          console.error("Failed to upload image:", uploadError);
          toast.error("Failed to upload profile image");
          setIsSubmitting(false);
          return;
        }
      }

      const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          bio: data.bio,
          profilePicture: profilePictureUrl,
          interests: data.interests,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.push(`/profile/user/${userId}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-3/4 mx-auto p-6 bg-black/50 border-2 border-stone-500 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <UserProfileNameField control={form.control} />
          <UserProfileBioField control={form.control} />
          <UserProfilePictureField control={form.control} />
          <UserProfileInterestsField control={form.control} />

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              onClick={() => {
                console.log("Current form values:", form.getValues());
                toast.info("Form values logged to console");
              }}
            >
              Debug Form
            </Button> */}
          </div>
        </form>
      </Form>
    </div>
  );
}
