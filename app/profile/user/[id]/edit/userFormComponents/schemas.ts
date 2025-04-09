import { z } from "zod";

const FileOrString = z.union([
  z.instanceof(File),
  z.string(),
  z.null()
]);

export const userProfileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  profilePicture: FileOrString.optional(),
  interests: z.array(z.string()).optional(),
});

export type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;