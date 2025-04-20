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
  organizationProfileFormSchema,
  OrganizationProfileFormValues,
} from "./schemas";
import {
  OrganizationNameField,
  OrganizationDescriptionField,
  OrganizationLocationField,
  OrganizationLogoField,
  OrganizationBannerField,
  OrganizationWebsiteField,
  OrganizationContactEmailField,
  OrganizationSocialLinksField,
} from "./OrganizationFormComponents";
import { uploadImageToSupabase } from "@/app/utils/supabase/imageUploadUtil";

interface OrganizationProfileFormProps {
  orgId?: string;
  userId?: string;
  defaultValues?: Partial<OrganizationProfileFormValues>;
}

export default function OrganizationProfileForm({
  orgId,
  userId,
  defaultValues = {},
}: OrganizationProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const isCreating = !orgId;

  const form = useForm<OrganizationProfileFormValues>({
    resolver: zodResolver(organizationProfileFormSchema),
    defaultValues: {
      name: defaultValues.name || "",
      description: defaultValues.description || "",
      location: defaultValues.location || "",
      logo: defaultValues.logo || "",
      banner: defaultValues.banner || "",
      website: defaultValues.website || "",
      contactEmail: defaultValues.contactEmail || "",
      socialLinks: defaultValues.socialLinks || {
        facebook: "",
        twitter: "",
        instagram: "",
        linkedin: "",
      },
    },
  });

  async function onSubmit(data: OrganizationProfileFormValues) {
    try {
      setIsSubmitting(true);

      let logoUrl = data.logo;
      let bannerUrl = data.banner;

      // If the logo is a File, upload it and get the URL
      if (data.logo instanceof File) {
        try {
          logoUrl = await uploadImageToSupabase(data.logo, "organizationLogo");
        } catch (uploadError) {
          console.error("Failed to upload logo:", uploadError);
          toast.error("Failed to upload organization logo");
          setIsSubmitting(false);
          return;
        }
      }

      // If the banner is a File, upload it and get the URL
      if (data.banner instanceof File) {
        try {
          bannerUrl = await uploadImageToSupabase(
            data.banner,
            "organizationBanner",
          );
        } catch (uploadError) {
          console.error("Failed to upload banner:", uploadError);
          toast.error("Failed to upload organization banner");
          setIsSubmitting(false);
          return;
        }
      }

      const organizationData = {
        name: data.name,
        description: data.description,
        location: data.location,
        logo: logoUrl,
        banner: bannerUrl,
        website: data.website,
        contactEmail: data.contactEmail,
        socialLinks: data.socialLinks,
      };

      // For creating a new organization, include the userId
      if (isCreating && userId) {
        Object.assign(organizationData, { userId });
      }

      const url = isCreating
        ? `${BASE_URL}/api/organizations`
        : `${BASE_URL}/api/organizations/${orgId}`;

      const method = isCreating ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.message ||
            `Failed to ${isCreating ? "create" : "update"} organization profile`,
        );
      }

      const result = await response.json();
      const successMessage = isCreating
        ? "Organization created successfully"
        : "Organization profile updated successfully";

      toast.success(successMessage);

      // Redirect to the organization profile page
      const redirectId = isCreating ? result.id : orgId;
      router.push(`/profile/organization/${redirectId}`);
      router.refresh();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Failed to ${isCreating ? "create" : "update"} organization profile`,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-3/4 mx-auto p-6 bg-black/50 border-2 border-stone-500 shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-6">
        {isCreating ? "Create Organization" : "Edit Organization"}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <OrganizationNameField control={form.control} />
          <OrganizationDescriptionField control={form.control} />
          <OrganizationLocationField control={form.control} />
          <OrganizationLogoField control={form.control} />
          <OrganizationBannerField control={form.control} />
          <OrganizationWebsiteField control={form.control} />
          <OrganizationContactEmailField control={form.control} />
          <OrganizationSocialLinksField control={form.control} />

          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isCreating
                  ? "Create Organization"
                  : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
