import { createClient } from "./client";
import { v4 as uuidv4 } from "uuid"; // You might need to install this: npm install uuid @types/uuid

const supabase = createClient();

export async function uploadImageToSupabase(
  file: File,
  folder: string = "events",
): Promise<string | null> {
  try {
    // Get file extension
    const fileExt = file.name.split(".").pop();
    // Generate unique file name
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("event-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading file:", error);
      return null;
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from("event-images")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("Error in uploadImageToSupabase:", error);
    return null;
  }
}
