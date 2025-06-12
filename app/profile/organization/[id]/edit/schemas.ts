import { z } from "zod";

const FileOrString = z.union([z.instanceof(File), z.string(), z.null()]);
const urlOrEmpty = z.union([
  z.string().url("Please enter a valid URL").or(z.literal("")),
  z.literal(""),
]);

export const organizationProfileFormSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  description: z.string().optional(),
  location: z.string().optional(),
  logo: FileOrString.optional(), // Can be a string URL or File
  banner: FileOrString.optional(), // Can be a string URL or File
  website: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .optional()
    .or(z.literal("")),
  contactEmail: z
    .string()
    .email({ message: "Please enter a valid email" })
    .optional()
    .or(z.literal("")),
  socialLinks: z
    .object({
      linkedin: urlOrEmpty.optional(),
      twitter: urlOrEmpty.optional(),
      instagram: urlOrEmpty.optional(),
      github: urlOrEmpty.optional(),
      facebook: urlOrEmpty.optional(),
      website: urlOrEmpty.optional(),
    })
    .optional(),
});

export type OrganizationProfileFormValues = z.infer<
  typeof organizationProfileFormSchema
>;

export type SocialLinksType = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
};
