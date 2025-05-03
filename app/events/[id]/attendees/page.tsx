"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MultiStepLoaderDemo from "../loading";

// Custom hooks
import useAttendees from "./hooks/useAttendees";

// Components
import AttendeeStats from "./components/AttendeeStats";
import HeaderActions from "./components/HeaderActions";
import SearchFilters from "./components/SearchFilters";
import AttendeeTable from "./components/AttendeeTable";
import AttendeeGrid from "./components/AttendeeGrid";
import AttendeeDetails from "./components/AttendeeDetails";

export default function AttendeesPage() {
  const params = useParams();
  const { id: eventId } = params;

  const {
    attendees,
    eventTitle,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isBulkCheckInMode,
    setIsBulkCheckInMode,
    selectedAttendees,
    setSelectedAttendees,
    filteredAttendees,
    stats,
    checkInAttendee,
    bulkCheckIn,
    toggleAttendeeSelection,
    exportAttendeesToCsv,
  } = useAttendees(eventId as string);

  const [selectedAttendee, setSelectedAttendee] = useState<
    (typeof attendees)[0] | null
  >(null);
  const [showResponsesDialog, setShowResponsesDialog] = useState(false);

  const handleViewResponses = (attendee: (typeof attendees)[0]) => {
    setSelectedAttendee(attendee);
    setShowResponsesDialog(true);
  };

  if (isLoading) {
    return <MultiStepLoaderDemo />;
  }

  return (
    <div className="container mx-auto py-6 mt-14 px-4 md:px-6">
      <HeaderActions
        eventId={eventId as string}
        isBulkCheckInMode={isBulkCheckInMode}
        setIsBulkCheckInMode={setIsBulkCheckInMode}
        selectedAttendees={selectedAttendees}
        setSelectedAttendees={setSelectedAttendees}
        handleBulkCheckIn={bulkCheckIn}
        handleExportAttendees={exportAttendeesToCsv}
        registeredCount={stats.registered}
      />

      <h1 className="text-3xl font-bold mb-6">
        {eventTitle} - Attendee Management
      </h1>

      <AttendeeStats stats={stats} />

      <div className="bg-black/70 rounded-lg shadow-sm border overflow-hidden mb-6">
        <Tabs defaultValue="table" className="w-full">
          <div className="border-b px-4 py-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 my-2">
              <TabsList className="h-9">
                <TabsTrigger value="table" className="text-sm">
                  Table View
                </TabsTrigger>
                <TabsTrigger value="grid" className="text-sm">
                  Grid View
                </TabsTrigger>
              </TabsList>

              <SearchFilters
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
              />
            </div>
          </div>

          <TabsContent value="table" className="m-0">
            <AttendeeTable
              filteredAttendees={filteredAttendees}
              isBulkCheckInMode={isBulkCheckInMode}
              selectedAttendees={selectedAttendees}
              toggleAttendeeSelection={toggleAttendeeSelection}
              handleViewResponses={handleViewResponses}
              handleCheckIn={checkInAttendee}
            />
          </TabsContent>

          <TabsContent value="grid" className="m-0">
            <AttendeeGrid
              filteredAttendees={filteredAttendees}
              handleViewResponses={handleViewResponses}
              handleCheckIn={checkInAttendee}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AttendeeDetails
        open={showResponsesDialog}
        onOpenChange={setShowResponsesDialog}
        selectedAttendee={selectedAttendee}
        handleCheckIn={checkInAttendee}
      />
    </div>
  );
}
