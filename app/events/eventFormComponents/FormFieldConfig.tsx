import React from "react";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFieldType } from "./types";
import { UseFormRegister } from "react-hook-form";
import { EventFormValues } from "./schemas";

// Props for the FormFieldConfig component
interface FormFieldConfigProps {
  field: {
    value: FormFieldType;
    register: UseFormRegister<EventFormValues>;
    update: (index: number, newValue: FormFieldType) => void;
  };
  index: number;
  formIndex: number;
  remove: (index: number) => void;
}

export const FormFieldConfig: React.FC<FormFieldConfigProps> = ({
  field,
  index,
  formIndex,
  remove,
}) => {
  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "select", label: "Dropdown" },
    { value: "textarea", label: "Text Area" },
    { value: "checkbox", label: "Checkbox" },
  ];

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium">Field #{index + 1}</h4>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-2/3 space-y-2">
              <FormLabel>Field Label</FormLabel>
              <Input
                {...field.register(
                  `registrationForms.${formIndex}.formFields.${index}.label`,
                )}
                placeholder="Field label"
              />
            </div>
            <div className="w-1/3 space-y-2">
              <FormLabel>Field Type</FormLabel>
              <Select
                value={field.value.type}
                onValueChange={(value) =>
                  field.update(index, {
                    ...field.value,
                    type: value as
                      | "text"
                      | "email"
                      | "number"
                      | "select"
                      | "textarea"
                      | "checkbox",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fieldTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="w-2/3 space-y-2">
              <FormLabel>Placeholder</FormLabel>
              <Input
                {...field.register(
                  `registrationForms.${formIndex}.formFields.${index}.placeholder`,
                )}
                placeholder="Field placeholder text"
              />
            </div>
            <div className="w-1/3 flex items-center pt-6">
              <input
                type="checkbox"
                id={`required-${formIndex}-${index}`}
                {...field.register(
                  `registrationForms.${formIndex}.formFields.${index}.required`,
                )}
                className="mr-2"
              />
              <label htmlFor={`required-${formIndex}-${index}`}>
                Required Field
              </label>
            </div>
          </div>

          {field.value.type === "select" && (
            <div>
              <FormLabel>Options (one per line)</FormLabel>
              <Textarea
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                value={(field.value.options || []).join("\n")}
                onChange={(e) => {
                  const options = e.target.value
                    .split("\n")
                    .filter((o) => o.trim());
                  field.update(index, { ...field.value, options });
                }}
                className="min-h-20"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
