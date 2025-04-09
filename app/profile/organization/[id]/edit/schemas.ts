import { z } from "zod";

const FileOrString = z.union([z.instanceof(File), z.string(), z.null()]);

export const organizationProfileFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().optional(),
  location: z.string().optional(),
  logo: FileOrString.optional(), // Can be a string URL or File
  banner: FileOrString.optional(), // Can be a string URL or File
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  contactEmail: z.string().email({ message: "Please enter a valid email" }).optional().or(z.literal("")),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
  }).optional(),
});

export type OrganizationProfileFormValues = z.infer<typeof organizationProfileFormSchema>;

export type SocialLinksType = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
};