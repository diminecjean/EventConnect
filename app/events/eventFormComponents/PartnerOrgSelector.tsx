"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { Control } from "react-hook-form";
import { BASE_URL } from "@/app/api/constants";

interface Organization {
  id: string;
  name: string;
}

interface PartnerOrganizationsFieldProps {
  control: Control<any>;
  name: string;
}

export default function PartnerOrganizationsField({
  control,
  name,
}: PartnerOrganizationsFieldProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch(`${BASE_URL}/api/organizations`);
        if (!response.ok) {
          throw new Error("Failed to fetch organization data");
        }
        const res = await response.json();

        console.log({ organizations: res.organizations });
        if (res.organizations) {
          setOrganizations(res.organizations);
        } else if (Array.isArray(res)) {
          setOrganizations(res);
        } else {
          console.error("Unexpected API response format:", res);
          setError("Unexpected data format from server");
        }
        setError(null);
      } catch (err) {
        setError("Failed to load partner organizations");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Partner Organizations</h3>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Partner Organizations</FormLabel>
            <FormControl>
              <div className="relative">
                <Select
                  disabled={isLoading}
                  onValueChange={(value) => {
                    const currentValues = Array.isArray(field.value)
                      ? field.value
                      : [];
                    if (!currentValues.includes(value)) {
                      field.onChange([...currentValues, value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoading
                          ? "Loading organizations..."
                          : "Select organizations"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {error ? (
                      <div className="p-2 text-red-500 text-sm">{error}</div>
                    ) : isLoading ? (
                      <div className="p-2 text-sm">
                        Loading organizations...
                      </div>
                    ) : organizations?.length === 0 ? (
                      <div className="p-2 text-sm">
                        No organizations available
                      </div>
                    ) : (
                      organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </FormControl>

            {/* Display selected organizations as badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {field.value?.map((orgId: string) => {
                const org = organizations.find((o) => o.id === orgId);
                const displayName = org ? org.name : orgId;

                return (
                  <Badge
                    key={orgId}
                    variant="secondary"
                    className="flex items-center gap-2 p-2"
                  >
                    {displayName}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => {
                        field.onChange(
                          field.value.filter((item: string) => item !== orgId),
                        );
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="bg-violet-500 bg-opacity-30 py-4 px-6 rounded-xl border-2 border-violet-700">
        <p className="text-xs text-violet-300 text-muted-foreground">
          Partner organizations will be displayed on your event page and can
          help promote your event to their members.
        </p>
      </div>
    </div>
  );
}
