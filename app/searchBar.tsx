"use client";
import * as React from "react";
import { Search, Calendar, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const categories = [
  { id: "all", label: "All Categories" },
  { id: "tech", label: "Tech" },
  { id: "business", label: "Business" },
  { id: "arts", label: "Arts" },
  { id: "sports", label: "Sports" },
  { id: "education", label: "Education" },
  { id: "social", label: "Social" },
  { id: "health", label: "Health" },
  { id: "entertainment", label: "Entertainment" },
] as const;

export const locations = [
  { id: "new-york", name: "New York" },
  { id: "london", name: "London" },
  { id: "tokyo", name: "Tokyo" },
  { id: "paris", name: "Paris" },
  { id: "singapore", name: "Singapore" },
  { id: "sydney", name: "Sydney" },
  { id: "berlin", name: "Berlin" },
  { id: "toronto", name: "Toronto" },
] as const;

export interface SearchParams {
  query: string;
  category: string;
  date?: Date | null;
  location: string;
}

interface EventSearchProps {
  onSearch: (searchParams: SearchParams) => void;
  isSearching?: boolean;
}

export default function EventSearch({
  onSearch,
  isSearching = false,
}: EventSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined,
  );
  const [selectedLocation, setSelectedLocation] = React.useState("");
  const [isLocationOpen, setIsLocationOpen] = React.useState(false);

  // Handle search submission
  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      category: selectedCategory,
      date: selectedDate,
      location: selectedLocation,
    });
  };

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDate(undefined);
    setSelectedLocation("");

    // Trigger search with cleared filters
    onSearch({
      query: "",
      category: "all",
      date: null,
      location: "",
    });
  };

  // Clear date selection
  const clearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4 my-12 rounded-lg bg-gradient-to-b from-zinc-200/80 to-zinc-400/80 backdrop-blur-md p-4 text-stone-950 shadow-sm dark:border-stone-800 dark:bg-violet-800/20 dark:text-stone-50 dark:from-inherit">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 text-xs md:text-md">
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="min-w-[160px] w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[160px] w-full justify-start text-left font-normal group"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span className="flex-1">
                  {selectedDate
                    ? selectedDate.toLocaleDateString()
                    : "Pick a date"}
                </span>
                {selectedDate && (
                  <X
                    className="h-4 w-4 opacity-70 hover:opacity-100 ml-2"
                    onClick={clearDate}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* Location Filter */}
          <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="min-w-[160px] w-full justify-start text-left font-normal"
              >
                <MapPin className="mr-2 h-4 w-4" />
                {locations.find((l) => l.id === selectedLocation)?.name ||
                  "Location"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search location..." />
                <CommandList>
                  <CommandEmpty>No location found.</CommandEmpty>
                  <CommandGroup heading="Locations">
                    {locations.map((location) => (
                      <CommandItem
                        key={location.id}
                        value={location.name}
                        onSelect={() => {
                          setSelectedLocation(location.id);
                          setIsLocationOpen(false);
                        }}
                      >
                        {location.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleSearch}
            variant={"secondary"}
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>

          {(searchQuery ||
            selectedCategory !== "all" ||
            selectedDate ||
            selectedLocation) && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="px-2"
              title="Clear all filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
