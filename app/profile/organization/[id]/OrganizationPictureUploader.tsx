"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormImageUploader from "@/app/events/imageUploader";
import { uploadImageToSupabase } from "@/app/utils/supabase/imageUploadUtil";
import { BASE_URL } from "@/app/api/constants";
import { toast } from "sonner";

interface OrganizationPictureUploaderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess: () => void;
}

const OrganizationPictureUploader = ({
  isOpen,
  onOpenChange,
  organizationId,
  onSuccess,
}: OrganizationPictureUploaderProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [caption, setCaption] = useState("");

  const handleImageChange = (file: File | string | null) => {
    if (file instanceof File) {
      setSelectedImage(file);
    } else {
      setSelectedImage(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      toast.error("Please select an image to upload");
      return;
    }

    try {
      setIsUploading(true);

      // Upload image to Supabase
      const imageUrl = await uploadImageToSupabase(
        selectedImage,
        `organizations/${organizationId}/pictures`,
      );

      if (!imageUrl) {
        throw new Error("Failed to upload image");
      }

      // Save picture data to your API
      const response = await fetch(
        `${BASE_URL}/api/organizations/${organizationId}/pictures`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl,
            caption,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save picture data");
      }

      toast.success("Picture uploaded successfully");
      setSelectedImage(null);
      setCaption("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Pictures</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormImageUploader
            name="picture"
            label="Organization Picture"
            onChange={handleImageChange}
            value={selectedImage}
            maxSizeMB={5}
            width="100%"
            height={240}
            scaleDesc="Recommended size: 1200x800 pixels"
          />

          <div className="mt-4">
            <label htmlFor="caption" className="text-sm font-medium">
              Caption (optional)
            </label>
            <input
              id="caption"
              type="text"
              className="w-full px-3 py-2 border rounded-md mt-1 bg-black"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption for this picture"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit}
              disabled={!selectedImage || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationPictureUploader;
