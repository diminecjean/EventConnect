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

export interface SearchParams {
  query: string;
  date?: Date | null;
  location: string;
}

interface EventSearchProps {
  onSearch: (searchParams: SearchParams) => void;
  isSearching?: boolean;
  initialQuery?: string;
  initialDate?: Date | null;
  initialLocation?: string;
}

export const locations = [
  { id: "kuala-lumpur", name: "Kuala Lumpur" },
  { id: "penang", name: "Penang" },
] as const;

export default function EventSearch({
  onSearch,
  isSearching = false,
  initialQuery = "",
  initialDate = undefined,
  initialLocation = "",
}: EventSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState(initialQuery);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    initialDate || undefined,
  );
  const [selectedLocation, setSelectedLocation] =
    React.useState(initialLocation);
  const [isLocationOpen, setIsLocationOpen] = React.useState(false);
  const [isDateOpen, setIsDateOpen] = React.useState(false);

  // Update state when props change
  React.useEffect(() => {
    setSearchQuery(initialQuery);
    setSelectedDate(initialDate || undefined);
    setSelectedLocation(initialLocation);
  }, [initialQuery, initialDate, initialLocation]);

  // Handle search submission
  const handleSearch = () => {
    onSearch({
      query: searchQuery,
      date: selectedDate,
      location: selectedLocation,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDate(undefined);
    setSelectedLocation("");

    // Trigger search with cleared filters
    onSearch({
      query: "",
      date: null,
      location: "",
    });
  };

  // Handle keyboard submission
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear date selection
  const clearDate = () => {
    setSelectedDate(undefined);

    // Trigger search with updated filters
    onSearch({
      query: searchQuery,
      date: null,
      location: selectedLocation,
    });
  };

  // Clear location selection
  const clearLocation = () => {
    setSelectedLocation("");

    // Trigger search with updated filters
    onSearch({
      query: searchQuery,
      date: selectedDate,
      location: "",
    });
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setIsDateOpen(false);

    // Trigger search with updated filters
    onSearch({
      query: searchQuery,
      date,
      location: selectedLocation,
    });
  };

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    setIsLocationOpen(false);

    // Trigger search with updated filters
    onSearch({
      query: searchQuery,
      date: selectedDate,
      location: locationId,
    });
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
          {/* Date Filter */}
          <div className="flex min-w-[160px] relative">
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Filter by date"}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearDate();
                }}
              >
                <X className="h-4 w-4 opacity-70 hover:opacity-100" />
              </Button>
            )}
          </div>

          {/* Location Filter */}
          <div className="flex min-w-[160px] relative">
            <Popover open={isLocationOpen} onOpenChange={setIsLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">
                    {locations.find((l) => l.id === selectedLocation)?.name ||
                      "Filter by location"}
                  </span>
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
                          onSelect={() => handleLocationSelect(location.id)}
                        >
                          {location.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {selectedLocation && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  clearLocation();
                }}
              >
                <X className="h-4 w-4 opacity-70 hover:opacity-100" />
              </Button>
            )}
          </div>
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

          {(searchQuery || selectedDate || selectedLocation) && (
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
