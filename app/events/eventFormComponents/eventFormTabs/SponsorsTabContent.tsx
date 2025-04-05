import React from "react";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Control, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormImageUploader from "../../imageUploader";
import { Textarea } from "@/components/ui/textarea";

interface SponsorsTabContentProps {
  form: UseFormReturn<EventFormValues>;
  control: Control<EventFormValues>;
  getValues: any;
  setValue: any;
  register: any;
  watch: any;
}

export const SponsorsTabContent: React.FC<SponsorsTabContentProps> = ({
  form,
  control,
  getValues,
  setValue,
  register,
  watch,
}) => {
  return (
    <div className="w-full mt-2">
      <div className="bg-amber-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-amber-700">
        <h3 className="text-md text-amber-300 font-semibold mb-2">
          Event Sponsors
        </h3>
        <p className="text-xs text-amber-300 text-muted-foreground">
          Add details about organizations sponsoring your event, whether they're
          providing monetary support, venue, food, or other resources.
        </p>
      </div>

      <FormField
        control={form.control}
        name="sponsors"
        render={({ field }) => (
          <FormItem>
            <Accordion type="multiple" className="w-full mt-4">
              {(field.value || []).map((sponsor, sponsorIndex) => (
                <AccordionItem
                  key={sponsor.id || sponsorIndex}
                  value={sponsor.id || `sponsor-${sponsorIndex}`}
                  className="border-b w-full"
                >
                  <div className="flex justify-between items-center w-full">
                    <AccordionTrigger className="py-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span>
                          {sponsor.name || `Sponsor #${sponsorIndex + 1}`}
                        </span>
                        {sponsor.sponsorType && (
                          <Badge variant="outline">{sponsor.sponsorType}</Badge>
                        )}
                      </div>
                    </AccordionTrigger>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        // Prevent event from bubbling up to the AccordionTrigger
                        e.stopPropagation();
                        // Remove this sponsor
                        const updatedSponsors = [...field.value];
                        updatedSponsors.splice(sponsorIndex, 1);
                        field.onChange(updatedSponsors);
                      }}
                      className="mr-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-4">
                      {/* Sponsor Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`sponsors.${sponsorIndex}.name`}
                          render={({ field: nameField }) => (
                            <FormItem>
                              <FormLabel>Organization Name</FormLabel>
                              <FormControl>
                                <Input
                                  {...nameField}
                                  placeholder="Organization name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`sponsors.${sponsorIndex}.sponsorType`}
                          render={({ field: typeField }) => (
                            <FormItem>
                              <FormLabel>Sponsorship Type</FormLabel>
                              <Select
                                onValueChange={typeField.onChange}
                                defaultValue={typeField.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="financial">
                                    Financial
                                  </SelectItem>
                                  <SelectItem value="venue">
                                    Venue Provider
                                  </SelectItem>
                                  <SelectItem value="food">
                                    Food & Beverages
                                  </SelectItem>
                                  <SelectItem value="technology">
                                    Technology
                                  </SelectItem>
                                  <SelectItem value="media">
                                    Media Partner
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Logo upload */}
                      <FormField
                        control={form.control}
                        name={`sponsors.${sponsorIndex}.logoUrl`}
                        render={({ field: logoField }) => (
                          <FormItem>
                            <FormLabel>Organization Logo</FormLabel>
                            <FormControl>
                              <FormImageUploader
                                name={`sponsor-logo-${sponsorIndex}`}
                                onChange={(file) => logoField.onChange(file)}
                                required={false}
                                maxSizeMB={1}
                                width={200}
                                height={200}
                                scaleDesc="Square format recommended"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name={`sponsors.${sponsorIndex}.description`}
                        render={({ field: descField }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                {...descField}
                                placeholder="Brief description of the sponsor and their contribution"
                                className="min-h-20"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Social Media Links */}
                      <div className="space-y-2">
                        <FormLabel>Social Media Links</FormLabel>
                        {(field.value[sponsorIndex]?.socialLinks || []).length >
                        0 ? (
                          <div className="space-y-2">
                            {(field.value[sponsorIndex]?.socialLinks || []).map(
                              (link, linkIndex) => (
                                <div key={linkIndex} className="flex gap-2">
                                  <FormField
                                    control={form.control}
                                    name={`sponsors.${sponsorIndex}.socialLinks.${linkIndex}.platform`}
                                    render={({ field: platformField }) => (
                                      <FormItem className="flex-1">
                                        <Select
                                          onValueChange={platformField.onChange}
                                          defaultValue={platformField.value}
                                        >
                                          <FormControl>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Platform" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="website">
                                              Website
                                            </SelectItem>
                                            <SelectItem value="linkedin">
                                              LinkedIn
                                            </SelectItem>
                                            <SelectItem value="twitter">
                                              Twitter
                                            </SelectItem>
                                            <SelectItem value="facebook">
                                              Facebook
                                            </SelectItem>
                                            <SelectItem value="instagram">
                                              Instagram
                                            </SelectItem>
                                            <SelectItem value="other">
                                              Other
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`sponsors.${sponsorIndex}.socialLinks.${linkIndex}.url`}
                                    render={({ field: urlField }) => (
                                      <FormItem className="flex-[3]">
                                        <FormControl>
                                          <Input
                                            {...urlField}
                                            placeholder="URL"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      const currentLinks = [
                                        ...(field.value[sponsorIndex]
                                          .socialLinks || []),
                                      ];
                                      currentLinks.splice(linkIndex, 1);
                                      const updatedSponsors = [...field.value];
                                      updatedSponsors[sponsorIndex] = {
                                        ...updatedSponsors[sponsorIndex],
                                        socialLinks: currentLinks,
                                      };
                                      field.onChange(updatedSponsors);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No social links added yet.
                          </p>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const currentSponsor = field.value[sponsorIndex];
                            const currentLinks =
                              currentSponsor.socialLinks || [];
                            const updatedSponsors = [...field.value];
                            updatedSponsors[sponsorIndex] = {
                              ...currentSponsor,
                              socialLinks: [
                                ...currentLinks,
                                {
                                  platform: "website",
                                  url: "",
                                },
                              ],
                            };
                            field.onChange(updatedSponsors);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Social Link
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {/* Add new sponsor button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => {
                const newSponsor = {
                  id: crypto.randomUUID(),
                  name: "",
                  sponsorType: "financial",
                  logoUrl: "",
                  description: "",
                  socialLinks: [],
                };
                field.onChange([...(field.value || []), newSponsor]);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sponsor
            </Button>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
