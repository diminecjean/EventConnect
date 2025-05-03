import React from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "checked-in" | "registered";
  setStatusFilter: (status: "all" | "checked-in" | "registered") => void;
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 w-full md:w-64"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as "all" | "checked-in" | "registered")}
        >
          <SelectTrigger className="w-full sm:w-36 h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Attendees</SelectItem>
            <SelectItem value="checked-in">Checked In</SelectItem>
            <SelectItem value="registered">Not Checked In</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}