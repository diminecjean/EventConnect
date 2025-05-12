import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, User, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EventSpeaker, SpeakerSocialMedia } from "./types";
import { SocialMediaInput } from "./SocialMediaInput";
import { Control, UseFormRegister, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "./schemas";
import FormImageUploader from "../imageUploader";
import { BASE_URL } from "@/app/api/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type ExistingUser = {
  _id: string;
  name: string;
  email?: string;
  profilePicture?: string;
  organization?: string;
  position?: string;
  socialMedia?: SpeakerSocialMedia[];
};

type SpeakerFormProps = {
  speaker: EventSpeaker;
  index: number;
  update: (
    index: number,
    field: string | Record<string, any>,
    value?: any,
  ) => void;
  remove: (index: number) => void;
  register: UseFormRegister<EventFormValues>;
  control: Control<EventFormValues>;
  form: UseFormReturn<EventFormValues>; // Add this type
};

export const SpeakerForm: React.FC<SpeakerFormProps> = ({
  speaker,
  index,
  update,
  remove,
  register,
  control,
  form,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ExistingUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    console.log({ speaker });
    if (speaker.userId) {
      // This will ensure the form fields are updated with the speaker data
      form.setValue(`speakers.${index}.name`, speaker.name);
      form.setValue(`speakers.${index}.organization`, speaker.organization);
      form.setValue(`speakers.${index}.position`, speaker.position);
      form.setValue(`speakers.${index}.imageUrl`, speaker.imageUrl);
      // Don't need to set social media as it's managed separately
    }
  }, [speaker, index, form]);

  // Search for users based on search term
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/users/search?term=${searchTerm}`,
        );
        if (!response.ok) {
          throw new Error("Failed to search users");
        }
        const data = await response.json();
        setSearchResults(Array.isArray(data.users) ? data.users : []);
      } catch (error) {
        console.error("Error searching users:", error);
        toast?.error("Error searching users");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search to avoid excessive API calls
    const debounceTimer = setTimeout(() => {
      if (searchTerm && isDialogOpen) {
        searchUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, isDialogOpen]);

  // Helper function to update social media
  const updateSocialMedia = (
    socialIndex: number,
    newValue: SpeakerSocialMedia,
  ) => {
    const updatedSocialMedia = [...(speaker.socialMedia || [])];
    updatedSocialMedia[socialIndex] = newValue;
    update(index, "socialMedia", updatedSocialMedia);
  };

  // Helper function to remove social media
  const removeSocialMedia = (socialIndex: number) => {
    const updatedSocialMedia = [...(speaker.socialMedia || [])];
    updatedSocialMedia.splice(socialIndex, 1);
    update(index, "socialMedia", updatedSocialMedia);
  };

  // Helper function to add new social media
  const addSocialMedia = () => {
    const newSocialMedia = {
      id: crypto.randomUUID(),
      platform: "twitter",
      url: "",
    };
    update(index, "socialMedia", [
      ...(speaker.socialMedia || []),
      newSocialMedia,
    ]);
  };

  // Helper function to select a user
  const selectUser = (user: ExistingUser) => {
    // Update all fields at once with a bulk update
    update(index, {
      userId: user._id,
      name: user.name || "",
      imageUrl: user.profilePicture,
      organization: user.organization,
      position: user.position,
      socialMedia: user.socialMedia,
    });

    setIsDialogOpen(false);
    setSearchTerm("");
    setSearchResults([]);

    toast.success(`${user.name || "User"} selected as speaker`);
  };

  // Check if this speaker is linked to an existing user
  const isLinkedToUser = Boolean(speaker.userId);

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium">Speaker #{index + 1}</h4>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <User className="h-4 w-4" />
                  {isLinkedToUser ? "Change User" : "Select Existing User"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select User</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for users by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  {/* Search results */}
                  {isLoading ? (
                    <div className="text-center py-2">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <ScrollArea className="max-h-[300px] overflow-y-auto">
                      <div className="space-y-1">
                        {searchResults.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center space-x-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md cursor-pointer"
                            onClick={() => selectUser(user)}
                          >
                            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center overflow-hidden">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{user.name}</p>
                              {user.email && (
                                <p className="text-xs text-slate-400">
                                  {user.email}
                                </p>
                              )}
                              {user.organization && (
                                <p className="text-xs text-slate-400">
                                  {user.organization}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : searchTerm.length > 1 ? (
                    <p className="text-sm text-center text-slate-400 py-2">
                      No users found
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 py-2">
                      Enter at least 2 characters to search for users
                    </p>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLinkedToUser && (
          <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            This speaker is linked to a user account. Changes you make here will
            not affect their profile.
            <Button
              type="button"
              variant="link"
              size="sm"
              className="p-0 h-auto text-blue-700"
              onClick={() => update(index, "userId", undefined)}
            >
              Unlink
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <FormLabel htmlFor={`speaker-name-${index}`}>Name*</FormLabel>
            <Input
              id={`speaker-name-${index}`}
              {...register(`speakers.${index}.name`)}
              placeholder="Speaker name"
            />
          </div>

          <div>
            <FormLabel htmlFor={`speaker-topic-${index}`}>
              Speaking Topic*
            </FormLabel>
            <Input
              id={`speaker-topic-${index}`}
              {...register(`speakers.${index}.topic`)}
              placeholder="Topic or session title"
            />
          </div>

          <div>
            <FormLabel htmlFor={`speaker-org-${index}`}>Organization</FormLabel>
            <Input
              id={`speaker-org-${index}`}
              {...register(`speakers.${index}.organization`)}
              placeholder="Company or organization"
            />
          </div>

          <div>
            <FormLabel htmlFor={`speaker-position-${index}`}>
              Position
            </FormLabel>
            <Input
              id={`speaker-position-${index}`}
              {...register(`speakers.${index}.position`)}
              placeholder="Job title or role"
            />
          </div>
        </div>

        <FormField
          control={control}
          name={`speakers.${index}.imageUrl`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <FormControl>
                <FormImageUploader
                  name={`speaker-image-${speaker.id}`}
                  onChange={(file) => {
                    console.log("Speaker image changed:", file);
                    field.onChange(file);
                  }}
                  value={field.value}
                  width={120}
                  height={120}
                  scaleDesc="Square image recommended"
                  maxSizeMB={1}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Social Media</FormLabel>
          </div>

          {speaker.socialMedia &&
            speaker.socialMedia.map((social, socialIndex) => (
              <SocialMediaInput
                key={social.id}
                value={social}
                index={socialIndex}
                speakerIndex={index}
                update={updateSocialMedia}
                remove={removeSocialMedia}
                register={register}
              />
            ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={addSocialMedia}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Social Media
          </Button>
        </div>

        {/* Hidden field to store userId */}
        <input type="hidden" {...register(`speakers.${index}.userId`)} />
      </CardContent>
    </Card>
  );
};
