import React from "react";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Control, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../schemas";
import FormImageUploader from "../../imageUploader";

interface PicturesTabContentProps {
  form: UseFormReturn<EventFormValues>;
  control: Control<EventFormValues>;
  getValues: any;
  setValue: any;
  register: any;
  watch: any;
}

export const PictureTabContent: React.FC<PicturesTabContentProps> = ({
  form,
  control,
  getValues,
  setValue,
  register,
  watch,
}) => {
  return (
    <div className="w-full mt-2">
      <div className="bg-emerald-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-emerald-700">
        <h3 className="text-md text-emerald-300 font-semibold mb-2">
          Event Gallery Images
        </h3>
        <p className="text-xs text-emerald-300 text-muted-foreground">
          Upload additional images for your event gallery. These will be
          displayed in a carousel on your event page. You can upload up to 10
          images.
        </p>
      </div>

      <FormField
        control={form.control}
        name="galleryImages"
        render={({ field }) => (
          <FormItem>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 w-full">
              {Array.from({
                length: Math.min(10, (field.value?.length || 0) + 1),
              }).map((_, index) => (
                <div key={index} className="w-full">
                  <FormImageUploader
                    name={`gallery-image-${index}`}
                    onChange={(file) => {
                      const currentImages = [...(field.value || [])];
                      // Check if file is not null before assigning
                      if (file) {
                        if (index < currentImages.length) {
                          // Replace existing image
                          currentImages[index] = file;
                        } else {
                          // Add new image
                          currentImages.push(file);
                        }
                        field.onChange(currentImages);
                      }
                    }}
                    required={false}
                    maxSizeMB={2}
                    height={200}
                    scaleDesc="1200px x 800px recommended"
                    value={field.value?.[index] || ""}
                    className="w-full h-48"
                  />
                  {field.value?.[index] && (
                    <div className="p-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const currentImages = [...(field.value || [])];
                          currentImages.splice(index, 1);
                          field.onChange(currentImages);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
