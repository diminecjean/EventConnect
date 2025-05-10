import { createClient } from "./client";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient();

// Allowed file types for event materials
const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF
  "application/vnd.ms-powerpoint", // PPT
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
  "text/csv", // CSV
  "application/vnd.ms-excel", // XLS
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/msword", // DOC
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
  "text/plain", // TXT
  "application/zip", // ZIP
];

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validates if the file type is allowed for event materials
 */
export function isValidMaterialType(file: File): boolean {
  return ALLOWED_FILE_TYPES.includes(file.type);
}

/**
 * Validates if the file size is within limits
 */
export function isValidMaterialSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Uploads event materials to Supabase storage
 * @param file The file to upload
 * @param folder Storage folder path (default: 'materials')
 * @returns Object with public URL of the uploaded file and error message if any
 */
export async function uploadMaterialToSupabase(
  file: File,
  folder: string = "materials",
): Promise<{ url: string | null; error: string | null }> {
  try {
    // Validate file type
    if (!isValidMaterialType(file)) {
      return {
        url: null,
        error: `Invalid file type: ${file.type}. Only PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, CSV, TXT, and ZIP files are allowed.`,
      };
    }

    // Validate file size
    if (!isValidMaterialSize(file)) {
      return {
        url: null,
        error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      };
    }

    // Generate a unique filename that preserves the original extension
    const fileExt = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("event-materials")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    console.log("Upload data:", data);

    if (error) {
      console.error("Error uploading material:", error);
      return {
        url: null,
        error: `Storage upload failed: ${error.message}`,
      };
    }

    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage
      .from("event-materials")
      .getPublicUrl(filePath);

    console.log("Public URL data:", publicUrlData);

    return {
      url: publicUrlData.publicUrl,
      error: null,
    };
  } catch (error) {
    console.error("Error in uploadMaterialToSupabase:", error);
    return {
      url: null,
      error: `Unexpected error during upload: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
