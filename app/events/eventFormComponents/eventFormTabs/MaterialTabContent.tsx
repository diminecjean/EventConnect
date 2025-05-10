import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Link as LinkIcon,
  FileSymlink,
  Upload,
  FileText,
} from "lucide-react";
import { Control, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../schemas";
import FormImageUploader from "../../imageUploader";
import { isValidMaterialType } from "@/app/utils/supabase/materialUploadUtil";

interface MaterialsTabContentProps {
  form: UseFormReturn<EventFormValues>;
  control: Control<EventFormValues>;
  getValues: any;
  setValue: any;
  register: any;
  watch: any;
}

export const MaterialTabContent: React.FC<MaterialsTabContentProps> = ({
  form,
  control,
  getValues,
  setValue,
  register,
  watch,
}) => {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [externalLinkInput, setExternalLinkInput] = useState("");
  const [externalLinkTitle, setExternalLinkTitle] = useState("");

  // Initialize materials object if it doesn't exist in the form
  React.useEffect(() => {
    const materials = form.getValues("materials");
    if (!materials) {
      form.setValue("materials", {
        galleryImages: [],
        uploads: [],
        urls: [],
      });
    }
  }, [form]);

  const validateExternalLink = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const addExternalLink = () => {
    if (!externalLinkInput) {
      setUploadError("Please enter a URL");
      return;
    }

    if (!validateExternalLink(externalLinkInput)) {
      setUploadError("Please enter a valid URL");
      return;
    }

    const materials = form.getValues("materials") || { urls: [] };
    const currentUrls = [...(materials.urls || [])];

    // Add link with title if available
    const linkEntry = externalLinkTitle
      ? `${externalLinkTitle}|${externalLinkInput}`
      : externalLinkInput;

    currentUrls.push(linkEntry);

    form.setValue("materials.urls", currentUrls);
    setExternalLinkInput("");
    setExternalLinkTitle("");
    setUploadError(null);
  };

  const handleMaterialUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = event.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!isValidMaterialType(file)) {
      setUploadError(`File type not supported: ${file.type}`);
      return;
    }

    // Store the file object temporarily to be processed during form submission
    const materials = form.getValues("materials") || { uploads: [] };
    const currentUploads = [...(materials.uploads || [])];

    // For now, store the File object
    currentUploads.push(file);

    form.setValue("materials.uploads", currentUploads);

    // Reset the file input
    event.target.value = "";
  };

  // Extract link title and URL from combined format "title|url"
  const extractLinkData = (
    linkEntry: string,
  ): { title: string; url: string } => {
    if (linkEntry.includes("|")) {
      const [title, url] = linkEntry.split("|");
      return { title, url };
    }
    return { title: new URL(linkEntry).hostname, url: linkEntry };
  };

  return (
    <div className="w-full mt-2 space-y-8">
      {/* Gallery Images Section */}
      <div className="space-y-4">
        <div className="bg-emerald-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-emerald-700">
          <h3 className="text-md text-emerald-300 font-semibold mb-2">
            Event Gallery Images
          </h3>
          <p className="text-xs text-emerald-300 text-muted-foreground">
            Upload photos from your event. These images will be publicly visible
            to anyone viewing the event.
          </p>
        </div>

        <FormField
          control={form.control}
          name="materials.galleryImages"
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

      {/* Material Uploads Section */}
      <div className="space-y-4 pt-6 border-t border-gray-700">
        <div className="bg-blue-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-blue-700">
          <h3 className="text-md text-blue-300 font-semibold mb-2">
            Downloadable Materials
          </h3>
          <p className="text-xs text-blue-300 text-muted-foreground">
            Upload presentations, PDFs, and other resources for attendees. These
            will only be accessible to registered participants.
          </p>
        </div>

        <FormField
          control={form.control}
          name="materials.uploads"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        document.getElementById("material-file-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                    <input
                      id="material-file-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                      onChange={handleMaterialUpload}
                    />
                  </div>

                  {uploadError && (
                    <p className="text-red-500 text-sm mt-1">{uploadError}</p>
                  )}

                  <FormDescription className="text-xs">
                    Supports PDF, PPT, PPTX, DOC, DOCX, XLS, XLSX, CSV, TXT, ZIP
                    files up to 10MB
                  </FormDescription>
                </div>

                {/* File list */}
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium">Uploaded Files</h4>
                    <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 space-y-2">
                      {field.value.map((file: any, index: number) => {
                        const fileName =
                          typeof file === "string"
                            ? file.split("/").pop()
                            : file.name;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-700 bg-opacity-40 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-400" />
                              <span className="text-sm truncate max-w-[300px]">
                                {fileName}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const currentUploads = [
                                  ...(Array.isArray(field.value)
                                    ? field.value
                                    : []),
                                ];
                                currentUploads.splice(index, 1);
                                field.onChange(currentUploads);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-400" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* External Links Section */}
      <div className="space-y-4 pt-6 border-t border-gray-700">
        <div className="bg-violet-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-violet-700">
          <h3 className="text-md text-violet-300 font-semibold mb-2">
            External Resource Links
          </h3>
          <p className="text-xs text-violet-300 text-muted-foreground">
            Add links to external resources related to the event. These links
            will only be accessible to registered participants.
          </p>
        </div>

        <FormField
          control={form.control}
          name="materials.urls"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Link title (optional)"
                      value={externalLinkTitle}
                      onChange={(e) => setExternalLinkTitle(e.target.value)}
                    />
                    <Input
                      placeholder="https://example.com/resource"
                      value={externalLinkInput}
                      onChange={(e) => setExternalLinkInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addExternalLink();
                        }
                      }}
                    />
                    <Button type="button" onClick={addExternalLink}>
                      Add Link
                    </Button>
                  </div>
                </div>

                {/* Links list */}
                {Array.isArray(field.value) && field.value.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium">External Links</h4>
                    <div className="bg-gray-800 bg-opacity-30 rounded-lg p-3 space-y-2">
                      {field.value.map((linkEntry: string, index: number) => {
                        const { title, url } = extractLinkData(linkEntry);

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-700 bg-opacity-40 rounded"
                          >
                            <div className="flex items-center space-x-2">
                              <LinkIcon className="h-4 w-4 text-violet-400" />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {title}
                                </span>
                                <span className="text-xs text-gray-400 truncate max-w-[300px]">
                                  {url}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(url, "_blank")}
                              >
                                <FileSymlink className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const currentUrls = [
                                    ...(Array.isArray(field.value)
                                      ? field.value
                                      : []),
                                  ];
                                  currentUrls.splice(index, 1);
                                  field.onChange(currentUrls);
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
