import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegistrationTypeFilterProps {
  formTypeFilter: string;
  setFormTypeFilter: (value: string) => void;
  registrationTypes: string[];
}

export default function RegistrationTypeFilter({
  formTypeFilter,
  setFormTypeFilter,
  registrationTypes,
}: RegistrationTypeFilterProps) {
  if (!registrationTypes.length) return null;

  return (
    <div className="space-y-1">
      <Select value={formTypeFilter} onValueChange={setFormTypeFilter}>
        <SelectTrigger className="h-8 w-[200px]">
          <SelectValue placeholder="All Registration Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Registration Types</SelectItem>
          {registrationTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
