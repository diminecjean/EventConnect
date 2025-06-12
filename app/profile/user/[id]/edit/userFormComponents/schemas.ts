import * as z from "zod";

// Add this validation function
const urlOrEmpty = z.union([
  z.string().url("Please enter a valid URL").or(z.literal("")),
  z.literal(""),
]);

export const userProfileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  position: z.string().optional(),
  organization: z.string().optional(),
  profilePicture: z.any().optional(),
  interests: z.array(z.string()).optional(),
  socialMedia: z
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

export type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;
