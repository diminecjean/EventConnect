import { useState } from "react";
import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { UserProfileFormValues } from "./schemas";

interface UserProfileInterestsFieldProps {
  control: Control<UserProfileFormValues>;
}

export function UserProfileInterestsField({
  control,
}: UserProfileInterestsFieldProps) {
  const [interestInput, setInterestInput] = useState("");

  return (
    <FormField
      control={control}
      name="interests"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Interests</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add an interest"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && interestInput.trim()) {
                      e.preventDefault();
                      if (!(field.value || []).includes(interestInput.trim())) {
                        field.onChange([
                          ...(field.value || []),
                          interestInput.trim(),
                        ]);
                      }
                      setInterestInput("");
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (
                      interestInput.trim() &&
                      !(field.value || []).includes(interestInput.trim())
                    ) {
                      field.onChange([
                        ...(field.value || []),
                        interestInput.trim(),
                      ]);
                      setInterestInput("");
                    }
                  }}
                >
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {field.value &&
                  field.value.map((interest, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => {
                          const newInterests = [...(field.value || [])];
                          newInterests.splice(index, 1);
                          field.onChange(newInterests);
                        }}
                        className="text-blue-800 hover:text-blue-950"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
