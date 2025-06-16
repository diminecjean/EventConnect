import React from "react";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { FormFieldConfig } from "../FormFieldConfig";
import { FormFieldType } from "../types";
import { Control, UseFormReturn } from "react-hook-form";
import { EventFormValues } from "../schemas";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormTabContentProps {
  form: UseFormReturn<EventFormValues>;
  control: Control<EventFormValues>;
  getValues: any;
  setValue: any;
  register: any;
  watch: any;
}

const FORM_TYPES = [
  { id: "Participant", label: "Participant" },
  { id: "Speaker", label: "Speaker" },
  { id: "Sponsor", label: "Sponsor" },
] as const;

export const FormTabContent: React.FC<FormTabContentProps> = ({
  form,
  control,
  getValues,
  setValue,
  register,
  watch,
}) => {
  // Function to check if a form name already exists
  const formNameExists = (name: string) => {
    const forms = form.getValues("registrationForms");
    return forms.some((form) => form.name === name);
  };

  // Get available form types (exclude ones already added)
  const getAvailableFormTypes = () => {
    return FORM_TYPES.filter((type) => !formNameExists(type.id));
  };

  return (
    <div className="w-full mt-2">
      <div className="bg-violet-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-violet-700">
        <h3 className="text-md text-violet-300 font-semibold mb-2">
          Registration Forms
        </h3>
        <p className="text-xs text-violet-300 text-muted-foreground">
          Customize the information you want to collect from different types of
          registrants. Participant registration is required, but you can add
          additional forms for other roles.
        </p>
      </div>

      <FormField
        control={form.control}
        name="registrationForms"
        render={({ field }) => (
          <FormItem>
            <Accordion
              type="multiple"
              className="w-full"
              defaultValue={["participant"]}
            >
              {/* Display existing registration forms */}
              {field.value.map((registrationForm, formIndex) => (
                <AccordionItem
                  key={registrationForm.id || formIndex}
                  value={
                    registrationForm.isDefault
                      ? "participant"
                      : registrationForm.id
                  }
                  className="border-b w-full"
                >
                  <div className="flex justify-between items-center w-full">
                    <AccordionTrigger className="py-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span>{registrationForm.name}</span>
                        {registrationForm.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                    </AccordionTrigger>

                    {!registrationForm.isDefault && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          // Prevent event from bubbling up to the AccordionTrigger
                          e.stopPropagation();
                          // Remove this form
                          const updatedForms = [...field.value];
                          updatedForms.splice(formIndex, 1);
                          field.onChange(updatedForms);
                        }}
                        className="mr-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`registrationForms.${formIndex}.name`}
                          render={({ field: nameField }) => (
                            <FormItem>
                              <FormLabel>Form Type</FormLabel>
                              <FormControl>
                                {registrationForm.isDefault ? (
                                  <Input
                                    value={nameField.value}
                                    disabled={true}
                                  />
                                ) : (
                                  <Select
                                    onValueChange={nameField.onChange}
                                    defaultValue={nameField.value}
                                    disabled={registrationForm.isDefault}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select form type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {FORM_TYPES.map((type) => (
                                        <SelectItem
                                          key={type.id}
                                          value={type.id}
                                        >
                                          {type.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`registrationForms.${formIndex}.description`}
                          render={({ field: descField }) => (
                            <FormItem>
                              <FormLabel>Form Description (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  {...descField}
                                  placeholder="Short description of this registration type"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Form Fields</h4>
                        {/* Display existing form fields */}
                        {(
                          form.watch(
                            `registrationForms.${formIndex}.formFields`,
                          ) || []
                        ).map((fieldValue, fieldIndex) => (
                          <FormFieldConfig
                            key={fieldValue.id || fieldIndex}
                            field={{
                              value: fieldValue,
                              register: form.register,
                              update: (idx, newValue) => {
                                const fields = [
                                  ...form.getValues(
                                    `registrationForms.${formIndex}.formFields`,
                                  ),
                                ];
                                fields[idx] = newValue;
                                form.setValue(
                                  `registrationForms.${formIndex}.formFields`,
                                  fields,
                                );
                              },
                            }}
                            index={fieldIndex}
                            formIndex={formIndex}
                            remove={() => {
                              const fields = [
                                ...form.getValues(
                                  `registrationForms.${formIndex}.formFields`,
                                ),
                              ];
                              fields.splice(fieldIndex, 1);
                              form.setValue(
                                `registrationForms.${formIndex}.formFields`,
                                fields,
                              );
                            }}
                          />
                        ))}

                        {/* Add new field button */}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mt-2"
                          onClick={() => {
                            const newField: FormFieldType = {
                              id: crypto.randomUUID(),
                              label: "",
                              type: "text",
                              required: false,
                              placeholder: "",
                            };
                            const currentFields =
                              form.getValues(
                                `registrationForms.${formIndex}.formFields`,
                              ) || [];
                            form.setValue(
                              `registrationForms.${formIndex}.formFields`,
                              [...currentFields, newField],
                            );
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Field
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {getAvailableFormTypes().length > 0 ? (
              <div className="mt-4 space-y-2">
                <FormDescription>
                  Add another registration form:
                </FormDescription>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => {
                      const selectedType = FORM_TYPES.find(
                        (t) => t.id === value,
                      );
                      if (selectedType) {
                        const newForm = {
                          id: crypto.randomUUID(),
                          name: selectedType.id, // Use the form type as the name
                          description: `Registration form for ${selectedType.label.toLowerCase()}s`,
                          formFields: [
                            {
                              id: crypto.randomUUID(),
                              label: "Full Name",
                              type: "text",
                              required: true,
                              placeholder: "Enter your full name",
                            },
                            {
                              id: crypto.randomUUID(),
                              label: "Email",
                              type: "email",
                              required: true,
                              placeholder: "Enter your email address",
                            },
                          ],
                          isDefault: false,
                        };
                        field.onChange([...field.value, newForm]);
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableFormTypes().map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <FormDescription className="mt-4 text-center text-muted-foreground">
                All form types have been added
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
